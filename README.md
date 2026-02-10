# tms-f (Vue 3 + TypeScript + Vite)

## Environment

Create a `.env` file for local development:

```bash
VITE_API_URL=http://localhost:8000/api
# Optional. Defaults to the origin of VITE_API_URL.
VITE_SANCTUM_URL=http://localhost:8000
```

`VITE_SANCTUM_URL` is used for the Sanctum CSRF endpoint (`/sanctum/csrf-cookie`).

## Laravel Sanctum + CORS note

If requests are sent with `withCredentials: true`, your backend CORS setup **cannot** use a wildcard origin (`*`).

Your Laravel backend should include explicit origins, for example:

```php
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,
```

Also ensure `allowed_methods` contains HTTP methods (e.g. `['*']`), not origin URLs.
