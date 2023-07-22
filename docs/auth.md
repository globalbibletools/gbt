# Authentication

We are using [lucia](https://lucia-auth.com/) to manage authentication and session. Lucia associates keys with each user. The primary key is the user's email and hashed password. Secondary temporary keys can be added to single use tokens.

Lucia sets a cookie `auth_session` to track the users session between requests. Session data is stored in the database.
