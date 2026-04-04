document.addEventListener("DOMContentLoaded", async () => {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  const body = document.getElementById("history-body");
  const messageEl = document.getElementById("history-message");

  try {
    showMessage(messageEl, "Loading history...", "muted");
    
    console.log("Calling API...");
    const history = await apiRequest("/quantitymeasurements/history");

    // DEBUG: Log the exact response structure
    console.log("=== RAW RESPONSE ===");
    console.log("Type:", typeof history);
    console.log("Is Array:", Array.isArray(history));
    console.log("Value:", history);
    console.log("Stringified:", JSON.stringify(history, null, 2));
    console.log("====================");

    if (!history) {
      console.log("History is null or undefined");
      body.innerHTML = `<tr><td colspan="4" class="muted">No response from server.</td></tr>`;
      showMessage(messageEl, "No response from backend.", "error");
      return;
    }

    if (!Array.isArray(history)) {
      console.log("History is not an array!");
      body.innerHTML = `<tr><td colspan="4" class="muted">Invalid response format - not an array.</td></tr>`;
      showMessage(messageEl, "Backend returned invalid format.", "error");
      return;
    }

    if (history.length === 0) {
      console.log("History array is empty");
      body.innerHTML = `<tr><td colspan="4" class="muted">No history available yet. Perform an operation to get started.</td></tr>`;
      showMessage(messageEl, "", "");
      return;
    }

    console.log("Processing", history.length, "items");
    body.innerHTML = "";
    
    history.forEach((item, idx) => {
      console.log(`Item ${idx}:`, item);
      const row = document.createElement("tr");
      
      // Parse timestamp
      let timeStr = "Invalid Date";
      const createdAtUtc = item.CreatedAtUtc || item.createdAtUtc;
      if (createdAtUtc) {
        try {
          const date = new Date(createdAtUtc);
          if (!isNaN(date.getTime())) {
            timeStr = date.toLocaleString();
          }
        } catch (e) {
          console.error("Date parse error:", e);
        }
      }

      // Get operation name
      const op = item.Operation || item.operation || "?";
      const opDisplay = String(op).toUpperCase();

      // Format input/output
      let input = "-";
      let output = "-";

      const op1Val = item.Operand1Value != null ? parseFloat(item.Operand1Value) : null;
      const op1Unit = item.Operand1UnitName || "";
      const op2Val = item.Operand2Value != null ? parseFloat(item.Operand2Value) : null;
      const op2Unit = item.Operand2UnitName || "";
      const resVal = item.ResultValue != null ? parseFloat(item.ResultValue) : null;
      const resUnit = item.ResultUnitName || "";

      if (opDisplay === "CONVERT") {
        input = op1Val != null ? `${op1Val.toFixed(2)} ${op1Unit}` : "-";
        output = resVal != null ? `${resVal.toFixed(2)} ${resUnit}` : "-";
      } else if (opDisplay === "COMPARE") {
        input = op1Val != null && op2Val != null ? `${op1Val.toFixed(2)} ${op1Unit} vs ${op2Val.toFixed(2)} ${op2Unit}` : "-";
        output = resVal === 1 || resVal === true ? "✓ Equal" : resVal === 0 || resVal === false ? "✗ Not Equal" : "-";
      } else if (opDisplay === "ADD") {
        input = op1Val != null && op2Val != null ? `${op1Val.toFixed(2)} ${op1Unit} + ${op2Val.toFixed(2)} ${op2Unit}` : "-";
        output = resVal != null ? `${resVal.toFixed(2)} ${resUnit}` : "-";
      } else if (opDisplay === "SUBTRACT") {
        input = op1Val != null && op2Val != null ? `${op1Val.toFixed(2)} ${op1Unit} - ${op2Val.toFixed(2)} ${op2Unit}` : "-";
        output = resVal != null ? `${resVal.toFixed(2)} ${resUnit}` : "-";
      } else if (opDisplay === "DIVIDE") {
        input = op1Val != null && op2Val != null ? `${op1Val.toFixed(2)} ${op1Unit} ÷ ${op2Val.toFixed(2)} ${op2Unit}` : "-";
        output = resVal != null ? `${resVal.toFixed(2)}` : "-";
      }

      row.innerHTML = `
        <td><small>${timeStr}</small></td>
        <td><strong>${opDisplay}</strong></td>
        <td>${input}</td>
        <td>${output}</td>
      `;
      body.appendChild(row);
    });

    showMessage(messageEl, `Showing ${history.length} operation${history.length !== 1 ? "s" : ""}.`, "success");
  } catch (error) {
    console.error("=== ERROR ===");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("==============");
    body.innerHTML = `<tr><td colspan="4" class="muted">Error loading history.</td></tr>`;
    showMessage(messageEl, error.message || "Failed to fetch history from backend.", "error");
  }
});

    body.innerHTML = "";
    history.forEach((item) => {
      const row = document.createElement("tr");
      
      // Parse timestamp - try both camelCase and PascalCase
      let timeStr = "Invalid Date";
      const createdAtUtc = getProperty(item, "createdAtUtc", "CreatedAtUtc");
      if (createdAtUtc) {
        try {
          const date = new Date(createdAtUtc);
          if (!isNaN(date.getTime())) {
            timeStr = date.toLocaleString();
          }
        } catch (e) {
          console.error("Date parsing error:", e, createdAtUtc);
        }
      }

      const { input, output } = formatHistoryRow(item);
      const opDisplay = String(getProperty(item, "operation", "Operation") || "?").toUpperCase();
      
      row.innerHTML = `
        <td><small>${timeStr}</small></td>
        <td><strong>${opDisplay}</strong></td>
        <td>${input}</td>
        <td>${output}</td>
      `;
      body.appendChild(row);
    });

    showMessage(messageEl, `Showing ${history.length} operation${history.length !== 1 ? "s" : ""}.`, "success");
  } catch (error) {
    renderEmpty("Could not load history from server.");
    showMessage(messageEl, error.message || "Failed to fetch history from backend.", "error");
    console.error("History fetch error:", error);
  }
});
