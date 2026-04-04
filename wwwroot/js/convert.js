document.addEventListener("DOMContentLoaded", () => {
  const typeEl = document.getElementById("measurementType");
  const valueEl = document.getElementById("inputValue");
  const fromUnitEl = document.getElementById("fromUnit");
  const toUnitEl = document.getElementById("toUnit");
  const form = document.getElementById("convert-form");
  const resultEl = document.getElementById("convert-result");
  const messageEl = document.getElementById("convert-message");

  function populateUnits() {
    const type = typeEl.value;
    if (!type) return;

    const units = getUnitsByType(type);
    fromUnitEl.innerHTML = "";
    toUnitEl.innerHTML = "";

    units.forEach((unit) => {
      const optionA = document.createElement("option");
      optionA.value = unit;
      optionA.textContent = formatUnit(unit);

      const optionB = optionA.cloneNode(true);
      fromUnitEl.appendChild(optionA);
      toUnitEl.appendChild(optionB);
    });

    if (units.length > 1) {
      toUnitEl.selectedIndex = 1;
    }
  }

  // Initialize card-based selector
  initMeasurementTypeSelector("measurementTypeSelector", "measurementType", populateUnits);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const type = typeEl.value;
    if (!type) {
      resultEl.textContent = "Please select a measurement type.";
      resultEl.className = "result-value error";
      return;
    }

    const input = Number(valueEl.value);
    const fromUnit = fromUnitEl.value;
    const toUnit = toUnitEl.value;

    if (!Number.isFinite(input) || input <= 0) {
      resultEl.textContent = "Please enter a valid positive number.";
      resultEl.className = "result-value error";
      return;
    }

    try {
      resultEl.textContent = "Converting...";
      resultEl.className = "result-value muted";

      // Capitalize measurement type for backend: length -> Length
      const measurementType = type.charAt(0).toUpperCase() + type.slice(1);

      const response = await apiRequest("/quantitymeasurements/convert", {
        method: "POST",
        body: JSON.stringify({
          quantity: {
            value: input,
            unitName: fromUnit,
            measurementType: measurementType,
          },
          targetUnitName: toUnit,
        }),
      });

      const output = `${formatNumber(input)} ${formatUnit(fromUnit)} = ${formatNumber(response.value)} ${formatUnit(toUnit)}`;
      resultEl.textContent = output;
      resultEl.className = "result-value";
      showMessage(messageEl, "Conversion completed.", "success");
    } catch (error) {
      resultEl.textContent = error.message || "Conversion failed.";
      resultEl.className = "result-value error";
      showMessage(messageEl, error.message, "error");
    }
  });
});
