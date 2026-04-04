const API_BASE_URL = "http://localhost:5000/api";

// JWT Token Management
function getAuthToken() {
  return localStorage.getItem("authToken");
}

function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}

function removeAuthToken() {
  localStorage.removeItem("authToken");
}

function isAuthenticated() {
  return !!getAuthToken();
}

function redirectToLogin() {
  window.location.href = "login.html";
}

// Backend Unit Enums - Exact format from backend
const UNIT_DEFINITIONS = {
  length: {
    FEET: "FEET",
    INCHES: "INCHES",
    YARDS: "YARDS",
    CENTIMETERS: "CENTIMETERS",
    MILLIMETER: "MILLIMETER",
  },
  weight: {
    KILOGRAM: "KILOGRAM",
    GRAM: "GRAM",
    TONNE: "TONNE",
  },
  volume: {
    LITRE: "LITRE",
    MILLILITRE: "MILLILITRE",
    GALLON: "GALLON",
  },
  temperature: {
    CELSIUS: "CELSIUS",
    FAHRENHEIT: "FAHRENHEIT",
    KELVIN: "KELVIN",
  },
};

const UNIT_LABELS = {
  FEET: "Feet (ft)",
  INCHES: "Inches (in)",
  YARDS: "Yards (yd)",
  CENTIMETERS: "Centimeters (cm)",
  MILLIMETER: "Millimeter (mm)",
  KILOGRAM: "Kilogram (kg)",
  GRAM: "Gram (g)",
  TONNE: "Tonne (t)",
  LITRE: "Litre (L)",
  MILLILITRE: "Millilitre (mL)",
  GALLON: "Gallon (gal)",
  CELSIUS: "Celsius (°C)",
  FAHRENHEIT: "Fahrenheit (°F)",
  KELVIN: "Kelvin (K)",
};

function getUnitsByType(type) {
  const config = UNIT_DEFINITIONS[type] || {};
  return Object.keys(config);
}

function formatUnit(unit) {
  return UNIT_LABELS[unit] || unit;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Invalid";
  }
  const rounded = Math.round((value + Number.EPSILON) * 1000000) / 1000000;
  return Number(rounded).toString();
}

function celsiusFrom(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return (value - 32) * (5 / 9);
  if (unit === "kelvin") return value - 273.15;
  return NaN;
}

function celsiusTo(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return value * (9 / 5) + 32;
  if (unit === "kelvin") return value + 273.15;
  return NaN;
}

function convertValue(type, value, fromUnit, toUnit) {
  if (!Number.isFinite(value)) {
    return NaN;
  }

  if (type === "temperature") {
    const inCelsius = celsiusFrom(value, fromUnit);
    return celsiusTo(inCelsius, toUnit);
  }

  const defs = UNIT_DEFINITIONS[type];
  if (!defs || !defs[fromUnit] || !defs[toUnit]) {
    return NaN;
  }

  const baseValue = value * defs[fromUnit];
  return baseValue / defs[toUnit];
}

async function apiRequest(endpoint, options = {}, allowUnauthenticated = false) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add Authorization header if token exists and endpoint requires auth
  if (token && !endpoint.includes("/auth/")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (response.status === 401) {
    // Unauthorized - token expired or invalid
    if (allowUnauthenticated) {
      // For endpoints like history save that are optional without auth, just return silently
      console.debug("Unauthenticated request to", endpoint, "- skipping");
      return null;
    }
    // For protected endpoints like history fetch, redirect to login
    removeAuthToken();
    redirectToLogin();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Map UI unit keys to backend format (already in correct format)
function mapUnitToBackendFormat(measurementType, unitKey) {
  // Units are already in the correct uppercase format from UNIT_DEFINITIONS
  // Just return the unit key as-is (it's already the enum value)
  return unitKey;
}

async function saveHistory(entry) {
  const payload = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  try {
    // Allow unauthenticated requests to save history endpoint
    // If user is not logged in, history won't be saved, but operations will still work
    await apiRequest("/quantitymeasurements/history", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true); // allowUnauthenticated = true
  } catch (error) {
    console.debug("History save failed (may be unauthenticated):", error.message);
  }
}

function showMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.className = type;
}

// Initialize measurement type card selector
function initMeasurementTypeSelector(selectorId, hiddenInputId, onChangeCallback) {
  const selector = document.getElementById(selectorId);
  const input = document.getElementById(hiddenInputId);

  if (!selector || !input) return;

  const cards = selector.querySelectorAll(".measurement-card");

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (card.classList.contains("disabled")) {
        return; // Don't allow selection of disabled cards
      }

      // Remove active class from all cards
      cards.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked card
      card.classList.add("active");

      // Set the hidden input value
      const type = card.dataset.type;
      input.value = type;

      // Trigger the callback
      if (onChangeCallback) {
        onChangeCallback(type);
      }
    });
  });
}

// Update navigation based on authentication status
function updateNavigation() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  const isAuth = isAuthenticated();
  const links = navLinks.querySelectorAll("a");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    
    if (href === "login.html") {
      link.style.display = isAuth ? "none" : "inline";
    } else if (href === "signup.html") {
      link.style.display = isAuth ? "none" : "inline";
    }
  });

  // Add logout button if authenticated and not already present
  if (isAuth && !navLinks.querySelector(".logout-btn")) {
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "logout-btn";
    logoutBtn.textContent = "Logout";
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      removeAuthToken();
      window.location.href = "login.html";
    });
    navLinks.appendChild(logoutBtn);
  }
}

// Call on every page load
document.addEventListener("DOMContentLoaded", updateNavigation);

