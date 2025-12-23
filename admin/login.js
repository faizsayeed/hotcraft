const API = "http://127.0.0.1:5000";

function loginAdmin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      // 🔐 Only ADMIN allowed
      if (data.user.role !== "ADMIN") {
        alert("Admin access only");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/admin/admin.html";
    })
    .catch(err => {
      console.error(err);
      alert("Login failed");
    });
}
