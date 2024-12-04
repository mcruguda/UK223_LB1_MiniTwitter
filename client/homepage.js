document.addEventListener('DOMContentLoaded', async () => {
  const tweetList = document.getElementById('tweet-list')
  const logoutBtn = document.getElementById('logout-btn')
  const tweetBtn = document.getElementById('create-tweet-btn')
  const response = await fetch('/api/getPosts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const result = await response.json()
  tweetList.innerHTML = ''
  result.forEach((tweet) => {
    tweetList.innerHTML += `<section class="flex justify-center">
                    <section
                        class="border-2 h-auto p-2 w-2/3 hover:cursor-pointer rounded-xl border-sky-500" onclick="window.location.href='/tweets/${tweet.postId}'"
                    >
                        <p class="font-bold">@${tweet.user}</p>
                        <p
                            class="resize-none overflow-hidden w-full h-auto border-none outline-none break-all"
                        >
                            ${tweet.content}
                        </p>
                    </section>
                </section>`
  })

  logoutBtn.addEventListener('click', async () => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token')
    }
    window.location.href = '/'
  })

  tweetBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    const tweetContent = document.getElementById('tweet-content').value
    const response = await fetch('/api/postTweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tweetContent }),
    })
  })
})
