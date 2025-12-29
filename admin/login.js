// ================== YOUR EXISTING LOGIN LOGIC ==================

function loginAdmin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const form = document.getElementById("loginForm");

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
      if (data.error || !data.user || data.user.role !== "ADMIN") {
        form.classList.add("wrong-entry");
        setTimeout(() => form.classList.remove("wrong-entry"), 1500);
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/admin/admin.html";
    })
    .catch(() => {
      alert("Login failed");
    });
}

// ================== PANDA ANIMATIONS ==================

// Hands up on password focus
const passwordInput = document.getElementById("password");
const form = document.getElementById("loginForm");

passwordInput.addEventListener("focus", () => {
  form.classList.add("up");
});

passwordInput.addEventListener("blur", () => {
  form.classList.remove("up");
});

// Panda eyes follow mouse
document.addEventListener("mousemove", (e) => {
  const balls = document.querySelectorAll(".eye-ball");
  const x = e.clientX / window.innerWidth * 10;
  const y = e.clientY / window.innerHeight * 10;

  balls.forEach(ball => {
    ball.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Prevent normal form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  loginAdmin();
});
