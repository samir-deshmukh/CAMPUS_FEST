# Testing and Verification Report

## 1. Testing scope
Testing covers the offline React website build, static-code quality, backend compilation, and security-focused source review.

## 2. Automated checks completed
### Frontend production build
Command: `cd admin && npm run build`

Result: **PASS**
- Vite production build completed successfully.
- Current generated bundle includes relative assets for offline use.

### Frontend lint
Command: `cd admin && npm run lint`

Result: **PASS**
- Oxlint reported **0 warnings and 0 errors**.

### Backend build
Command: `./mvnw -q -f backend/pom.xml -DskipTests package`

Result: **PASS**
- Spring Boot backend compiled and packaged successfully after the authorization fixes.

### Git whitespace validation
Command: `git diff --check`

Result: **PASS**

## 3. Security verification performed
- Student-only self-registration enforced.
- Registration cancellation checks ownership.
- Entry-pass issue/retrieval checks student ownership.
- Organizer/admin check-in is role restricted.
- Competition modification/deletion checks creator ownership or admin role.
- Judge assignment verifies the target account has JUDGE role.
- Judge scoring verifies assignment, competition state, participant eligibility, criteria completeness, duplicate criteria and score bounds.
- Result publication checks competition ownership for organizers and permits admin override.
- Passwords are stored using BCrypt rather than plaintext.
- Entry-pass tokens are generated using `SecureRandom` and do not contain personal data.
- Event capacity uses a database row lock during registration.

## 4. Manual demo test checklist
- [ ] Open the offline `admin/dist/index.html` build.
- [ ] Navigate through Overview, Events, Schedule, My Passes, Results, Campus Map, Lost & Found and Profile.
- [ ] Search/filter events.
- [ ] Open event details.
- [ ] Register for an unregistered event and verify pass state.
- [ ] Verify registered event cannot be registered twice.
- [ ] Switch demo role to Organizer and inspect organizer workspace.
- [ ] Switch demo role to Judge and inspect judging workspace.
- [ ] Test responsive layout at desktop and mobile-sized viewport.
- [ ] Confirm no external network dependency is required for the static demo.

## 5. Known test limitation
The static demo uses local mock state, so it does not prove end-to-end integration with PostgreSQL or the Spring Boot API. Those require a running backend/database test environment.
