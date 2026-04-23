
Action: file_editor create /app/memory/test_credentials.md --file-text "# SHOUTUP - Test Credentials

## Admin Account (seeded automatically)
- Email: `admin@shoutup.in`
- Password: `ShoutUp@2026`
- Role: `admin`

## Client accounts
Register any new client via `/api/auth/register` or the website's Sign Up modal.

## Notes
- Admin is auto-seeded on backend startup.
- JWT returned on login/register; pass as `Authorization: Bearer <token>`.
"
Observation: Overwrite successful: /app/memory/test_credentials.md