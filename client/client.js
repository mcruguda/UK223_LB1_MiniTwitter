const loginBtn = document.getElementById('login-btn')
const registerRouteBtn = document.getElementById('register-route')

loginBtn.addEventListener('click', async () => {
  const loginUser = document.getElementById('username-value').value
  const loginPassword = document.getElementById('password-value').value
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: loginUser,
      password: loginPassword,
    }),
  })

  if (response.ok) {
    const data = await response.json()
    window.location.href = '/homepage'
  } else if (response.status == 401) {
    document.getElementById('error-msg').innerText =
      'Benutzer oder Passwort falsch'
  } else if (response.status == 404 || response.status == 500) {
    document.getElementById('error-msg').innerText =
      'Server nicht erreichbar, probieren sie später nochmal'
  } else {
    document.getElementById('error-msg').innerText =
      'Ein Fehler ist aufgetretten'
  }
})

registerRouteBtn.addEventListener('click', async () => {
  window.location.href = '/register'
})
