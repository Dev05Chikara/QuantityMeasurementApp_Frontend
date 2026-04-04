document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in on login page
  const isLoginPage = document.getElementById("login-form") !== null && document.getElementById("loginUsername") !== null;
  if (isLoginPage && isAuthenticated()) {
    window.location.href = "operations.html";
    return;
  }

  // Check if user is already logged in on signup page
  const isSignupPage = document.getElementById("signup-form") !== null && document.getElementById("signupUsername") !== null;
  if (isSignupPage && isAuthenticated()) {
    window.location.href = "operations.html";
    return;
  }

  // Handle Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const usernameEl = document.getElementById("loginUsername");
      const passwordEl = document.getElementById("loginPassword");
      const messageEl = document.getElementById("login-message");

      const username = usernameEl.value.trim();
      const password = passwordEl.value;

      if (!username || !password) {
        showMessage(messageEl, "Username and password are required.", "error");
        return;
      }

      try {
        showMessage(messageEl, "Logging in...", "muted");
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });

        setAuthToken(response.token);
        showMessage(messageEl, "Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "operations.html";
        }, 1500);
      } catch (error) {
        showMessage(messageEl, error.message || "Login failed. Please check your credentials.", "error");
        passwordEl.value = "";
      }
    });
  }

  // Handle Signup
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const usernameEl = document.getElementById("signupUsername");
      const passwordEl = document.getElementById("signupPassword");
      const confirmPasswordEl = document.getElementById("signupConfirmPassword");
      const messageEl = document.getElementById("signup-message");

      const username = usernameEl.value.trim();
      const password = passwordEl.value;
      const confirmPassword = confirmPasswordEl.value;

      // Validation
      if (!username || !password) {
        showMessage(messageEl, "Username and password are required.", "error");
        return;
      }

      if (username.length < 3) {
        showMessage(messageEl, "Username must be at least 3 characters.", "error");
        return;
      }

      if (password.length < 6) {
        showMessage(messageEl, "Password must be at least 6 characters.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showMessage(messageEl, "Passwords do not match.", "error");
        confirmPasswordEl.value = "";
        return;
      }

      try {
        showMessage(messageEl, "Creating account...", "muted");
        const response = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({ 
            username, 
            password,
            role: "User"
          }),
        });

        showMessage(messageEl, "Account created! Redirecting to login...", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        showMessage(messageEl, error.message || "Signup failed. Please try again.", "error");
        passwordEl.value = "";
        confirmPasswordEl.value = "";
      }
    });
  }

  // Add logout button if on operations or history page
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      removeAuthToken();
      window.location.href = "login.html";
    });
  }
});
