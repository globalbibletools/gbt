# Authentication

We are using [lucia](https://lucia-auth.com/) to manage authentication and session.
Authentication is handled on the api server since there are plans to have multiple apps with a common login.

Presently, only magic links sent via an email are supported. We may add passwords and SSO options later. Only existing users are able to log in. New users must be invited by a system or language admin.

## Login in Dev Environments

In local environments, emails are just logged to the terminal rather than sending to an SMTP server. To log in, copy and paste the link that would have been sent in the email.

## Authentication Flow

```mermaid
sequenceDiagram
  User->>Browser: enter email
  Browser->>API: POST /api/auth/login with email and redirect

  alt if user exists
    API->>API: generate one time key and send email
  end

  API->>Browser: return 204 status code
  Browser->>Browser: show notice to check email

  break when user opens email
    User->>Browser: clicks email link
    Browser->>API: GET /api/auth/login with token and redirect

    alt if token is valid
      API->>API: set session cookie
    end

    API->>Browser: redirects to redirect url

    alt if token is valid
      Browser->>Browser: show requested page
    end
    alt if token is expired or used
      Browser->>Browser: show error page
    end
  end
```

## Cookies

**`auth_session`** - This cookie has the session ID that is used to look up the session in the database on the server.
