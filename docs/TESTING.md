# Testing and Verification Report

## 1. Review scope

The review covered the active Python API, all three React clients, dependency manifests, security documentation, deployment configuration and repository hygiene after the Exhibition feature rollback.

## 2. Automated checks

### Python syntax

```bash
python3 -m py_compile backend/app/main.py
```

Result: **PASS** after the security changes.

### Git whitespace

```bash
git diff --check
```

Result: **PASS** at the time of review before the documentation/security commit.

### Frontend dependency audit

Commands:

```bash
npm --prefix admin audit --omit=dev --audit-level=moderate
npm --prefix site audit --omit=dev --audit-level=moderate
npm --prefix scanner audit --omit=dev --audit-level=moderate
```

Result: **0 reported vulnerabilities** in all three npm production dependency trees during this review.

### Python dependency audit

A Python `pip`/`pip-audit` executable is not installed on the review machine, so an equivalent automated Python advisory scan could not be run locally. This is recorded as a test limitation rather than a false pass.

## 3. Static security review

Checked for:

- hardcoded secrets and default JWT/admin credentials
- wildcard CORS
- token-bearing URLs
- unparameterized SQL
- unsafe image data-URI acceptance
- missing backend authentication dependencies
- frontend-only authorization
- session revocation behavior
- excessive public gallery responses
- stale documentation describing an unused backend

The identified issues were fixed where practical in the active code.

## 4. Build checks to run before release

```bash
npm --prefix site ci && npm --prefix site run build
npm --prefix admin ci && npm --prefix admin run build
npm --prefix scanner ci && npm --prefix scanner run build
python3 -m py_compile backend/app/main.py
git diff --check
```

## 5. Manual security test matrix

### Authentication
- [ ] Wrong admin password returns 401.
- [ ] Missing admin tab identity is rejected.
- [ ] Invalid/expired admin JWT is rejected.
- [ ] Scanner login fails when credentials are wrong.
- [ ] Scanner JWT stops working after scanner credential change.

### Authorization
- [ ] Admin-only endpoints reject anonymous requests.
- [ ] Scanner endpoints reject admin tokens.
- [ ] Scanner verification cannot be performed without scanner authentication.

### QR/pass integrity
- [ ] Valid pass works for the correct event.
- [ ] Same pass cannot be entered twice.
- [ ] Cancelled pass is rejected.
- [ ] A pass for another event is rejected.
- [ ] Pass token is not placed in the request URL by the current web clients.

### Input/upload validation
- [ ] Oversized image is rejected.
- [ ] SVG image is rejected.
- [ ] Invalid mobile number is rejected.
- [ ] Overlong text is rejected server-side.
- [ ] SQL metacharacters are treated as data rather than query syntax.

### Browser security
- [ ] API responses contain the baseline security headers.
- [ ] Production CORS contains only the three intended frontend origins.
- [ ] Static sites are deployed with CSP/security headers.

## 6. Test limitations

A complete end-to-end test requires a running PostgreSQL instance and configured environment secrets. An independent DAST/penetration test and Python advisory scan are still recommended before production use.
