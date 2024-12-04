document.addEventListener('DOMContentLoaded', async () => {
  const tweet = document.getElementById('tweet')
  const commentBtn = document.getElementById('create-comment-btn')
  const response = await fetch(
    `/api/getTweet/${window.location.pathname.split('/')[2]}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const result = await response.json()
  tweet.innerHTML = ''
  tweet.innerHTML += `<section class="flex justify-center">
                         <section
                             class="border-2 h-auto p-2 w-2/3 hover:cursor-pointer rounded-xl border-sky-500 bg-sky-200"
                         >
                         <p>Tweet</p>
                             <p class="font-bold">@${result.user}</p>
                             <p
                                 class="resize-none font-semibold overflow-hidden w-full h-auto border-none outline-none break-all"
                             >
                                 ${result.content}
                             </p>
                         </section>
                     </section>`
  result.comments.forEach((comment) => {
    tweet.innerHTML += `<section class="flex justify-center">
                         <section
                             class="border-2 h-auto p-2 w-2/3 hover:cursor-pointer rounded-xl border-sky-500"
                         >
                             <p class="font-bold">@${comment.commentUserId}</p>
                             <p
                                 class="resize-none overflow-hidden w-full h-auto border-none outline-none break-all"
                             >
                                 ${comment.content}
                             </p>
                         </section>
                     </section>`
  })

  commentBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    const commentContent = document.getElementById('comment-content').value
    const postId = window.location.pathname.split('/')[2]
    const response = await fetch(
      `/api/createComment?postId=${Number(postId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentContent }),
      }
    )
  })
})
