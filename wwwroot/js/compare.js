document.addEventListener("DOMContentLoaded", () => {
  const typeEl = document.getElementById("compareType");
  const value1El = document.getElementById("value1");
  const unit1El = document.getElementById("unit1");
  const value2El = document.getElementById("value2");
  const unit2El = document.getElementById("unit2");
  const form = document.getElementById("compare-form");
  const resultEl = document.getElementById("compare-result");
  const messageEl = document.getElementById("compare-message");

  function populateUnits() {
    const type = typeEl.value;
    if (!type) return;

    const units = getUnitsByType(type);
    unit1El.innerHTML = "";
    unit2El.innerHTML = "";

    units.forEach((unit) => {
      const optionA = document.createElement("option");
      optionA.value = unit;
      optionA.textContent = formatUnit(unit);
      const optionB = optionA.cloneNode(true);
      unit1El.appendChild(optionA);
      unit2El.appendChild(optionB);
    });

    if (units.length > 1) {
      unit2El.selectedIndex = 1;
    }
  }

  // Initialize card-based selector
  initMeasurementTypeSelector("compareTypeSelector", "compareType", populateUnits);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const type = typeEl.value;
    if (!type) {
      resultEl.textContent = "Please select a measurement type.";
      resultEl.className = "result-value error";
      return;
    }

    const value1 = Number(value1El.value);
    const value2 = Number(value2El.value);
    const unit1 = unit1El.value;
    const unit2 = unit2El.value;

    if (!Number.isFinite(value1) || !Number.isFinite(value2)) {
      resultEl.textContent = "Both values must be valid numbers.";
      resultEl.className = "result-value error";
      return;
    }

    try {
      resultEl.textContent = "Comparing...";
      resultEl.className = "result-value muted";

      // Capitalize measurement type for backend: length -> Length
      const measurementType = type.charAt(0).toUpperCase() + type.slice(1);

      const response = await apiRequest("/quantitymeasurements/compare", {
        method: "POST",
        body: JSON.stringify({
          operand1: {
            value: value1,
            unitName: unit1,
            measurementType: measurementType,
          },
          operand2: {
            value: value2,
            unitName: unit2,
            measurementType: measurementType,
          },
        }),
      });

      // Backend returns value: 1 for equal, 0 for not equal
      let resultText = "";
      if (response.value === 1) {
        resultText = "Values are Equal";
      } else if (response.value > 0) {
        resultText = "Value 1 is Greater than Value 2";
      } else {
        resultText = "Value 1 is Lesser than Value 2";
      }

      resultEl.textContent = resultText;
      resultEl.className = "result-value";
      showMessage(messageEl, `Comparison completed.`, "success");
    } catch (error) {
      resultEl.textContent = error.message || "Comparison failed.";
      resultEl.className = "result-value error";
      showMessage(messageEl, error.message, "error");
    }
  });
});
