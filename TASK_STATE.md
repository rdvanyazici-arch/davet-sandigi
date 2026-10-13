# Task State

## Current task

- [x] Create a clean desktop folder from the current GitHub repository.
- [x] Track `origin/main` from `rdvanyazici-arch/davet-sandigi`.
- [x] Open the clean folder in a separate trusted VS Code window.
- [x] Add the clean folder to GitHub Desktop.
- [x] Verify the current site locally.
- [x] Close the old VS Code project window.
- [x] Remove the old `Davet-Sandigi-Claude` entry from GitHub Desktop without deleting its files.
- [x] Verify the production deployment after publishing.
- [x] Audit the live site for content, functionality, mobile layout, accessibility, SEO, performance, and security risks.
- [x] Define the Supabase migration, showroom, admin panel, media library, WhatsApp ordering, testing, deployment, and final legal-text roadmap.

## Verified facts

- Local folder: `/Users/mac/Desktop/Davet-Sandigi-Guncel`
- Production source: root `index.html`
- Stack: single-file HTML/CSS/JavaScript
- GitHub remote: `https://github.com/rdvanyazici-arch/davet-sandigi.git`
- Vercel project: `rdvanyazici/davet-sandigi`
- Production URL: `https://davet-sandigi.vercel.app`
- Current local preview: `http://127.0.0.1:4174/`
- The cloned `index.html` is the current `origin/main` version.
- Before the latest task-state update, `main` was synchronized with `origin/main`.
- Latest synchronized commit: `f0e3e11` (`proje kuralları`).
- Production deployment was verified at `https://davet-sandigi.vercel.app` after publishing.
- VS Code and GitHub Desktop are currently focused on the clean, current project.
- The live site is broadly aligned with its invitation and personalized-gift purpose.
- Priority findings: draft legal texts, unverified marketing/testimonial claims, public admin link, incomplete order validation, duplicate-prone local order numbers, missing SEO metadata, weak modal accessibility, and a 6.3 MB single-file payload with no lazy-loaded images.
- Target architecture: public showroom without customer accounts, admin-only Supabase Auth, public-read/admin-write database access, Supabase Storage media library, local cart, and WhatsApp order requests.
- Detailed implementation order is recorded in `PROJECT_ROADMAP.md`; legal texts are intentionally the final implementation phase.

## Pending decisions

- Make future site changes only in this clean folder.
- Apply the approved audit fixes in priority order; do not publish before user approval.
- Start with Phase 0 in `PROJECT_ROADMAP.md` only after user approval.

## Safety note

Before pushing or deploying, verify the local folder, GitHub repository, and Vercel project names so this project is not mixed with `softrandevum`.
