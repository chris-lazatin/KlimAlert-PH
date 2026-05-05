# KlimAlert PH · PHP / MySQL backend

A drop-in REST backend for the KlimAlert PH front end.
Designed for **XAMPP / LAMP** so it runs locally on your Gordon College laptop
and can be deployed to any cheap shared host that supports PHP 8.1+ and MySQL 5.7+.

> Capstone author: **Christopher V. Lazatin** · Gordon College, BSIT 2nd Year

---

## 1. Folder layout

```
php-backend/
  config.php                  # DB credentials & app constants
  .htaccess                   # Apache hardening + URL rewrite
  lib/
    helpers.php               # JSON/CORS/validation/rate-limit
    session.php               # cookie-based session, hashed at rest
  auth/
    register.php              # POST  → bcrypt hash + create session
    login.php                 # POST  → verify + create session
    logout.php                # POST  → revoke session
    me.php                    # GET   → current user
  reports/
    create.php                # POST  → submit hazard report (multipart)
    list.php                  # GET   → feed of reports
  evac/
    list.php                  # GET   → ONLY available evac centers
  uploads/                    # photos uploaded by reporters (auto-created)
```

SQL migrations live one folder up in `/scripts/`:

```
scripts/
  001_create_users_and_sessions.sql
  002_create_reports.sql
  003_create_evac_centers.sql
  004_seed_sample_data.sql
```

---

## 2. Setup on XAMPP (Windows)

1. Start **Apache** + **MySQL** in the XAMPP control panel.
2. Open <http://localhost/phpmyadmin> and import the SQL files **in order**:
   `001 → 002 → 003 → 004`.
3. Copy `php-backend/` into `C:\xampp\htdocs\klimalert-api\`.
4. Edit `config.php` if your MySQL user is not `root` with a blank password.
5. Browse to <http://localhost/klimalert-api/auth/me.php>.
   You should see `{"ok":false,"error":"Not authenticated."}` — that means the
   backend is alive.

---

## 3. Security checklist (already implemented)

| Concern              | Implementation                                                                |
| -------------------- | ----------------------------------------------------------------------------- |
| SQL injection        | PDO with `ATTR_EMULATE_PREPARES=false`, prepared statements **everywhere**    |
| Password storage     | `password_hash($pw, PASSWORD_BCRYPT)` + `password_verify` + auto re-hash      |
| Session theft        | Cookie holds `<sid>.<secret>`; only **sha256(secret)** stored in DB           |
| Cookie hijacking     | `HttpOnly`, `SameSite=Lax`, `Secure` in production                            |
| Brute force          | 5 failed logins → 15-min lock + IP rate limit (`rate_limit()`)                |
| Email enumeration    | Login returns the same generic error for "no user" and "wrong password"      |
| File uploads         | `finfo` MIME sniff + extension whitelist + 5 MB cap + random filename         |
| CORS                 | Only the configured front-end origin is allowed; credentials enabled          |
| XSS via JSON         | All responses are `application/json`, `X-Content-Type-Options: nosniff`       |
| Audit                | `audit_log` table records register, login_ok, login_failed, login_locked,…   |

---

## 4. API reference

All endpoints return JSON `{ "ok": true, ... }` on success or
`{ "ok": false, "error": "..." }` on failure with a non-2xx status.

### `POST /auth/register.php`

```json
{
  "full_name": "Juan Dela Cruz",
  "email":     "juan@example.com",
  "mobile":    "09171234567",
  "password":  "secret123",
  "barangay":  "Gordon Heights",
  "role":      "citizen"
}
```

→ `201 { ok, user }` and sets the `klimalert_sid` cookie.

### `POST /auth/login.php`

```json
{ "email": "juan@example.com", "password": "secret123" }
```

→ `200 { ok, user }` + cookie. After 5 wrong attempts the account is locked for 15 minutes (HTTP 423).

### `POST /auth/logout.php`

Destroys the session row and clears the cookie.

### `GET /auth/me.php`

→ `200 { ok, user }` if authenticated, `401` otherwise.

### `POST /reports/create.php`

`multipart/form-data` so a photo can be attached.

| field         | type   | required | notes                                                         |
| ------------- | ------ | -------- | ------------------------------------------------------------- |
| `hazard_type` | string | yes      | flood, fire, landslide, fallen_tree, road_blocked, power_outage, other |
| `severity`    | string | yes      | low, moderate, high, critical                                 |
| `barangay`    | string | yes      | one of the 17 Olongapo barangays                              |
| `landmark`    | string | no       |                                                               |
| `description` | string | yes      | 1–500 chars                                                   |
| `anonymous`   | "0/1"  | no       | hides reporter's name                                         |
| `latitude`    | float  | no       | from `navigator.geolocation`                                  |
| `longitude`   | float  | no       |                                                               |
| `photo`       | file   | no       | JPG/PNG, ≤5 MB                                                |

### `GET /reports/list.php?status=pending&barangay=Asinan&limit=50`

Returns up to 200 reports, newest first.

### `GET /evac/list.php`

Returns **only** evacuation centers with status `open` or `limited`.
The view `v_available_evac_centers` does the filtering, so even if a future
admin page accidentally queries the table directly, you can switch the source
to the view in one place.

---

## 5. Calling the backend from the Next.js front end

The form components in this repo currently mock submission with `setTimeout`.
Replace those calls with `fetch()` against the PHP API. Always send credentials
so the session cookie is included:

```ts
// app/(auth)/login/page.tsx — replace the mock submit with:
const res = await fetch('http://localhost/klimalert-api/auth/login.php', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const data = await res.json()
if (!res.ok) { setError(data.error); return }
router.push('/dashboard')
```

```ts
// components/dashboard/hazard-report-form.tsx — replace the mock submit with:
const fd = new FormData()
fd.set('hazard_type', type)
fd.set('severity', severity)
fd.set('barangay', barangay)
fd.set('landmark', landmark)
fd.set('description', description)
fd.set('anonymous', anonymous ? '1' : '0')
if (coords) { fd.set('latitude', String(coords.lat)); fd.set('longitude', String(coords.lng)) }
if (photo)   fd.set('photo', photo.file)

const res = await fetch('http://localhost/klimalert-api/reports/create.php', {
  method: 'POST',
  credentials: 'include',
  body: fd,
})
```

When you migrate the front end fully to PHP for the capstone defense, the same
endpoints are reusable — just submit standard HTML forms.

---

## 6. Going to production

1. Set `APP_ENV` to `production` in `config.php`.
2. Move `DB_PASS` to an environment variable and `require` it.
3. Force HTTPS so the `Secure` cookie flag actually applies.
4. Replace the file-based `rate_limit()` with Redis or DB-backed counters.
5. Schedule `DELETE FROM sessions WHERE expires_at < NOW()` nightly.
