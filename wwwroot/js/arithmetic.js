document.addEventListener("DOMContentLoaded", () => {
  const typeEl = document.getElementById("arithType");
  const operationEl = document.getElementById("arithOperation");
  const value1El = document.getElementById("arithValue1");
  const value2El = document.getElementById("arithValue2");
  const unit1El = document.getElementById("arithUnit1");
  const unit2El = document.getElementById("arithUnit2");
  const form = document.getElementById("arithmetic-form");
  const resultEl = document.getElementById("arith-result");
  const messageEl = document.getElementById("arith-message");

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
  initMeasurementTypeSelector("arithTypeSelector", "arithType", populateUnits);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const type = typeEl.value;
    if (!type) {
      resultEl.textContent = "Please select a measurement type.";
      resultEl.className = "result-value error";
      return;
    }

    if (type === "temperature") {
      resultEl.textContent = "Temperature arithmetic is not allowed.";
      resultEl.className = "result-value error";
      return;
    }

    const operation = operationEl.value;
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
      resultEl.textContent = "Calculating...";
      resultEl.className = "result-value muted";

      // Capitalize measurement type for backend: length -> Length
      const measurementType = type.charAt(0).toUpperCase() + type.slice(1);
      
      // Determine endpoint based on operation
      let endpoint;
      if (operation === "add") {
        endpoint = "/quantitymeasurements/add";
      } else if (operation === "subtract") {
        endpoint = "/quantitymeasurements/subtract";
      } else if (operation === "divide") {
        endpoint = "/quantitymeasurements/divide";
      }

      const response = await apiRequest(endpoint, {
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

      // Handle different result formats based on operation
      let resultText;
      if (operation === "add") {
        resultText = `${formatNumber(value1)} ${formatUnit(unit1)} + ${formatNumber(value2)} ${formatUnit(unit2)} = ${formatNumber(response.value)} ${formatUnit(response.unitName)}`;
      } else if (operation === "subtract") {
        resultText = `${formatNumber(value1)} ${formatUnit(unit1)} - ${formatNumber(value2)} ${formatUnit(unit2)} = ${formatNumber(response.value)} ${formatUnit(response.unitName)}`;
      } else if (operation === "divide") {
        // Division returns a dimensionless scalar
        resultText = `${formatNumber(value1)} ${formatUnit(unit1)} ÷ ${formatNumber(value2)} ${formatUnit(unit2)} = ${formatNumber(response.value)}`;
      }

      resultEl.textContent = resultText;
      resultEl.className = "result-value";
      showMessage(messageEl, "Calculation completed.", "success");
    } catch (error) {
      resultEl.textContent = error.message || "Calculation failed.";
      resultEl.className = "result-value error";
      showMessage(messageEl, error.message, "error");
    }
  });
});
