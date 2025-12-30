function loginAdmin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const form = document.getElementById("loginForm");

  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.token || !data.user || !data.user.is_admin) {
        form.classList.add("wrong-entry");
        setTimeout(() => form.classList.remove("wrong-entry"), 1500);
        return;
      }

      // ✅ SINGLE SOURCE OF TRUTH
      localStorage.setItem("hotcraft_token", data.token);

      // ✅ CORRECT PATH
      window.location.href = "/admin/admin.html";
    })
    .catch(() => alert("Login failed"));
}
