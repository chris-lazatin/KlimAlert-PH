# KlimAlert PH · SQL migrations

Run these on a fresh MySQL 5.7+ / MariaDB 10.4+ database **in numeric order**:

```bash
mysql -u root -p < 001_create_users_and_sessions.sql
mysql -u root -p < 002_create_reports.sql
mysql -u root -p < 003_create_evac_centers.sql
mysql -u root -p < 004_seed_sample_data.sql   # dev only
```

On XAMPP, open phpMyAdmin → **Import** and pick each `.sql` file one at a time.

| File | What it creates |
|------|-----------------|
| `001_create_users_and_sessions.sql` | `barangays`, `users` (bcrypt hashes), `sessions`, `audit_log` |
| `002_create_reports.sql`            | `hazard_reports`, `hazard_confirmations` |
| `003_create_evac_centers.sql`       | `evacuation_centers`, `v_available_evac_centers` view, `alerts` |
| `004_seed_sample_data.sql`          | demo users, real Olongapo evac centers, sample alerts & report |

> The `v_available_evac_centers` view is what the public Olongapo locator queries
> — it automatically excludes any center whose status is `full` or `closed`,
> matching the instructor's requirement.

The full PHP backend that consumes this schema lives in `../php-backend/`.
