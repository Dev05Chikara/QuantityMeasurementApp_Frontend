document.addEventListener("DOMContentLoaded", async () => {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  const body = document.getElementById("history-body");
  const messageEl = document.getElementById("history-message");

  try {
    showMessage(messageEl, "Loading history...", "muted");
    
    const history = await apiRequest("/quantitymeasurements/history");

    if (!history || !Array.isArray(history) || history.length === 0) {
      body.innerHTML = `<tr><td colspan="4" class="muted">No history available yet. Perform an operation to get started.</td></tr>`;
      showMessage(messageEl, "", "");
      return;
    }

    body.innerHTML = "";
    
    history.forEach((item) => {
      const row = document.createElement("tr");
      
      // 1. Parse timestamp properly
      let timeStr = "Invalid Date";
      if (item.CreatedAtUtc) {
        try {
          const date = new Date(item.CreatedAtUtc);
          if (!isNaN(date.getTime())) {
            timeStr = date.toLocaleString();
          }
        } catch (e) {
          // Invalid date format
        }
      }

      // 2. Get operation as string
      const op = String(item.Operation || "?").toUpperCase();

      // 3. Extract all the values
      const op1Val = item.Operand1Value;
      const op1Unit = item.Operand1UnitName;
      const op2Val = item.Operand2Value;
      const op2Unit = item.Operand2UnitName;
      const resVal = item.ResultValue;
      const resUnit = item.ResultUnitName;

      let input = "-";
      let output = "-";

      // 4. Format input/output based on operation
      if (op === "CONVERT") {
        input = (op1Val != null && op1Unit) ? `${parseFloat(op1Val).toFixed(2)} ${op1Unit}` : "-";
        output = (resVal != null && resUnit) ? `${parseFloat(resVal).toFixed(2)} ${resUnit}` : "-";
      } 
      else if (op === "COMPARE") {
        if (op1Val != null && op1Unit && op2Val != null && op2Unit) {
          input = `${parseFloat(op1Val).toFixed(2)} ${op1Unit} vs ${parseFloat(op2Val).toFixed(2)} ${op2Unit}`;
        }
        output = (resVal === 1) ? "✓ Equal" : (resVal === 0) ? "✗ Not Equal" : "-";
      } 
      else if (op === "ADD") {
        if (op1Val != null && op1Unit && op2Val != null && op2Unit) {
          input = `${parseFloat(op1Val).toFixed(2)} ${op1Unit} + ${parseFloat(op2Val).toFixed(2)} ${op2Unit}`;
        }
        output = (resVal != null && resUnit) ? `${parseFloat(resVal).toFixed(2)} ${resUnit}` : "-";
      } 
      else if (op === "SUBTRACT") {
        if (op1Val != null && op1Unit && op2Val != null && op2Unit) {
          input = `${parseFloat(op1Val).toFixed(2)} ${op1Unit} - ${parseFloat(op2Val).toFixed(2)} ${op2Unit}`;
        }
        output = (resVal != null && resUnit) ? `${parseFloat(resVal).toFixed(2)} ${resUnit}` : "-";
      } 
      else if (op === "DIVIDE") {
        if (op1Val != null && op1Unit && op2Val != null && op2Unit) {
          input = `${parseFloat(op1Val).toFixed(2)} ${op1Unit} ÷ ${parseFloat(op2Val).toFixed(2)} ${op2Unit}`;
        }
        output = (resVal != null) ? `${parseFloat(resVal).toFixed(2)}` : "-";
      }

      row.innerHTML = `
        <td><small>${timeStr}</small></td>
        <td><strong>${op}</strong></td>
        <td>${input}</td>
        <td>${output}</td>
      `;
      body.appendChild(row);
    });

    showMessage(messageEl, `Showing ${history.length} operation${history.length !== 1 ? "s" : ""}.`, "success");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="4" class="muted">Error loading history.</td></tr>`;
    showMessage(messageEl, error.message || "Failed to fetch history from backend.", "error");
  }
});
