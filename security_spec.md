# Security Specification for AtollFeeNa

## 1. Data Invariants
- `DiveLog`: Must have a `userId` matching `request.auth.uid`. `diveNumber` must be positive. `date` is required.
- `UserProfile`: Document ID must match `request.auth.uid`.
- `DiveSite`: `name`, `atoll`, and `difficulty` are required.
- `MarineLife`: `name`, `scientificName`, and `category` are required.

## 2. Dirty Dozen Payloads (Target: Rejection)
1. Creating a `DiveLog` for another user UID.
2. Updating a `DiveLog` belonging to another user.
3. Creating a `DiveSite` with an invalid `difficulty` (e.g., "expert").
4. Updating a `MarineLife` entry to change `rarity` to an invalid value.
5. Creating a `UserProfile` where the document ID does not match `request.auth.uid`.
6. Attempting to delete a `DiveSite` without being signed in.
7. Injecting a 1MB string into `DiveSite.description`.
8. Updating a `DiveLog` to set `rating` to 100 (max 5).
9. Creating a `DiveLog` without a `siteId`.
10. Spoofing `createdAt` by providing a past client-side timestamp instead of server time.
11. Reading another user's `DiveLog` directly by ID.
12. Listing all `DiveLog` without filtering by `userId`.

## 3. Test Scenarios
- Authenticated user can CRUD their own logs.
- Authenticated user can CRUD dive sites (shared repository).
- Authenticated user can CRUD marine life (shared repository).
- Authenticated user can manage their own profile.
- Unauthenticated user can only read dive sites and marine life.
