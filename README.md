# A simple NodeJS Webapplication that allows yout to Post Tweets

### Getting Started

1. Clone the repo
 
2. Run "docker compose up"

3. Create Roles "User", "Administrator", "Moderator" in the phpmyadmin (username: minitwitter, password: supersecret123)

4. Access the site on localhost:8080

### Information

I could not completely finish the Project, alot of the API endpoints are made but not yet implemented, they work if used through thunderclient/postman but are not connected to the client frontend yet.
Furthermore as specified on top, the Roles have to be created manually at the moment.
Admin/Moderator functionality are not yet implemented!

At the moment the comments are shown with their user_id instead of username.

### Bugs

There's a few bugs like for example after creating the first tweet or comment on a tweet the backend crashes, it will restart by itself and should work from then on out.
This is due to the list being empty not being handled properly because I didn't have the time.
