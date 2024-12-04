const registerBtn = document.getElementById('register-btn')

registerBtn.addEventListener('click', async () => {
  const registerUser = document.getElementById('register-username-value').value
  const registerPassword = document.getElementById(
    'register-password-value'
  ).value
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: registerUser,
      password: registerPassword,
    }),
  })

  if (response.ok) window.location.href = '/login'
})
