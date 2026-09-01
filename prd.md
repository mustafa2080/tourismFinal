Product Requirements Document (PRD) — Travel Packages Platform

Stack: Node.js (Backend) + React.js (Frontend)
Database: PostgreSQL — tour (owner: postgres, port: 5432, password provided)

1. Project summary

A responsive travel marketplace where each trip (package) belongs to one or more categories. Customers can search, filter, view package detail pages, and book packages. Bookings are paid on arrival (no online Visa payment). Booking must be created at least 15 days before the trip start date. Real-time notifications inform admins and users about booking events.

2. Goals & success metrics

Fast, mobile-first UX with a smart search and filters → Goal: 75%+ visitors convert to viewing details; CTR on hero offers ≥ 8%.

Reliable booking flow with PDF invoices & realtime notifications → Goal: <1% booking failures.

Admin tools for package, pricing, and booking management → Goal: reduce manual support tickets by 40%.

3. Key users & user stories

Visitors / Guests

As a visitor I want a smart search + filters so I can quickly find relevant packages.

As a visitor I want to view high-quality galleries and itineraries to evaluate trips.

Authenticated Customers

As a user I want to book a trip (pay on arrival) and receive confirmation by email/WhatsApp.

As a user I want to see my bookings, wishlist, and past trip reviews.

Admin

As an admin I want to manage packages, prices, bookings, customers, and view sales reports.

As an admin I want realtime alerts for new bookings and near-deadline cancellations.

4. Functional requirements (pages & features)
Homepage

Smart Search bar (search text + filters): Destination, Date, Budget, Trip Type.

Hero slider: high-res images, title, short price, CTA “Book Now”.

Featured destinations: 6–8 cards (image, name, rating, "price from", duration).

Testimonials: customer photo + name + star rating + short comment.

Counters: dynamic totals (e.g., “10,000+ trips”, “500+ destinations”, “98% satisfaction”).

Acceptance criteria: search returns relevant packages within 300ms; hero CTA tracks clicks.

Search & Filters

Side filters: Trip type (Family / Adventure / Honeymoon), Budget range, Duration, Rating, Activities.

Results: grid/list toggle — image, program name, price, rating, days, “Details” button.

Sort options: Price (low→high), Top Rated, Date (closest), Most Popular.

Acceptance criteria: combination filters apply without page reload (client-side + API support).

Package Details

Gallery (10–15 images) with zoom + optional intro video.

Basic info: name, destination, duration, price per person.

Daily itinerary: day-by-day description, images, activities, meals.

Included / Excluded checklist.

Price options: Single / Double room / Child / Add-ons (VIP, private transfer).

Reviews: star summary, reviews list, ability to add review (after trip).

FAQ, fast “Book Now” with final price calc.

Acceptance criteria: gallery loads progressively; price calculation accurate for options.

Booking & Payment (Booking system)

Booking form: name, email, phone, number of persons, selected date, extras, notes.

Business rule: booking must be made ≥ 15 days before trip start date — enforce both UI and backend validation.

Payment: On arrival (option fields showing “Pay on arrival”). Save payment method if user chooses later.

Booking confirmation: unique booking number, booking summary, downloadable PDF invoice.

Notifications: email + WhatsApp + in-app realtime notification on booking creation and changes.

Admin receives alert for new booking.

Acceptance criteria: cannot create booking violating 15-day rule; booking creates invoice and triggers notifications.

User Dashboard

Bookings list with statuses (Confirmed / Pending / Completed).

Wishlist (save packages).

Profile settings (name, avatar, password).

Trip history + ability to leave reviews/photos.

Acceptance criteria: user sees up-to-date booking status; can download invoices.

Blog & Guides

Articles with images and rich text (e.g., “Top 10 in Sharm”).

Interactive destination guides: small map, country facts, travel tips, embedded videos.

Video gallery for past trips.

Acceptance criteria: CMS-like interface for admins to create/edit posts.

About & Contact pages

About: company info, mission, team.

Contact: contact form, phone, email, office location (Google Maps embed).

5. Admin panel (internal)

CRUD for packages (title, categories, images, itinerary, inclusions/exclusions, price options).

Booking management: view, change status, issue refunds/notes.

Customers & reviews management (approve/remove).

Sales reports & exports (CSV, date ranges).

CMS for blog posts.

Notifications logs and templates.

Acceptance criteria: admins can perform package edits and see booking realtime updates.

6. Non-functional & UX requirements

Responsive design (mobile / tablet / desktop).

At least English language support (i18n-ready for future languages).

Maps: interactive Google Maps for hotels, landmarks.

Accessibility: follow WCAG basic guidelines.

Real customer reviews only (flagging & moderation).

HTTPS everywhere; payment/sensitive pages flagged “Secure payment” even if pay-on-arrival.

7. Real-time & notifications

Realtime: use Socket.IO (Node) for in-app realtime notifications (new booking, status change).

Push channels: Email (SMTP provider / SendGrid), WhatsApp messages (Twilio or official WhatsApp Business API), SMS (optional).

Notification events: booking:created, booking:confirmed, booking:reminder (e.g., 7 days & 24 hours before trip).

Reminder schedule: automatic reminders by email/WhatsApp at configurable intervals (e.g., 7 days, 3 days, 24 hours).

Note: for WhatsApp/WhatsApp Business you will need official credentials and phone number registration.

8. Data model (high level) — PostgreSQL (tour)

Database credentials (as provided):

DB name: tour

Host: (env var)

Port: 5432

User: postgres

Password: 123456

Core tables (suggested):

users (id, name, email, phone, password_hash, role, avatar, created_at)

packages (id, title, destination_id, duration_days, base_price, short_desc, long_desc, featured, created_at)

package_images (id, package_id, url, alt_text, order)

categories (id, name, slug)

package_categories (package_id, category_id)

itineraries (id, package_id, day_number, title, description, image_url)

bookings (id, user_id, package_id, booking_number, status, persons, date_start, date_created, payment_type, total_price, notes)

booking_extras (booking_id, extra_key, price)

reviews (id, user_id, package_id, rating, comment, created_at, approved)

notifications (id, user_id, type, payload(jsonb), is_read, created_at)

blog_posts (id, title, body, slug, published, author_id, created_at)

admin_audit_logs (action, actor_id, target, payload, created_at)

Storage: images and video assets on S3 (recommended) with URLs stored in DB.

9. API design (examples)

Use REST (Express) or GraphQL depending on preference. Example REST endpoints:

POST /api/auth/register — register user

POST /api/auth/login — login → JWT token

GET /api/packages — list & filter query params (q, category, minPrice, maxPrice, duration, sort)

GET /api/packages/:id — package details + itinerary + images + reviews

POST /api/bookings — create booking (validate 15-day rule)

GET /api/users/:id/bookings — user bookings

GET /api/admin/bookings — admin bookings (protected)

POST /api/packages — create package (admin)

Websocket namespace: /notifications — emit booking:created, etc.

Auth: JWT for frontend API auth; refresh tokens recommended.

10. Layers & architecture (must be layered; enforced)

Layer 1 — Presentation (Frontend, React.js)

Components, routes, pages, forms, client-side validation, i18n. Uses REST/GraphQL client + WebSocket client.

Layer 2 — API / Controller (Node.js Express)

Route handlers: parse requests, authenticate, sanitize input, pass to service layer.

Layer 3 — Services / Business Logic

Booking rules (15-day enforcement), price calculation, notification scheduling, image processing. Contains transactional logic.

Layer 4 — Data Access / Repository

ORM (TypeORM or Sequelize) models and repository functions. Single place for DB queries.

Layer 5 — Infrastructure / Integration

External integrations (Email provider, WhatsApp, S3, Google Maps), background workers (cron jobs), WebSocket server.

Additional: Background worker (e.g., Bull + Redis) for sending emails, generating PDFs, scheduled reminders.

Enforcement: codebase should strictly separate layers; controllers must not directly perform raw DB queries or heavy business logic.

11. Security & compliance

All secrets via environment variables (do not hardcode DB password). Although provided above, use process.env.* in production.

HTTPS + HSTS.

Input validation & sanitization to prevent SQL injection / XSS.

Passwords: bcrypt or argon2.

Rate limiting on auth endpoints.

PCI: since payment is on arrival, no online card storage — reduce PCI scope. Still secure any payment-related inputs.

12. Operational concerns

Logging & monitoring (e.g., Winston + ELK or external logging).

Error reporting (Sentry).

Backups: scheduled DB backups.

Scalability: separate services for WebSocket and API; use CDN for assets.

13. Testing

Unit tests for services (booking rules, pricing).

Integration tests for API endpoints.

End-to-end tests (Cypress) for main flows: search → detail → booking.

Load test critical endpoints (search, package list).

14. Deployment & infra suggestions

Host API on Node.js server (Heroku / DigitalOcean / AWS ECS).

Use managed Postgres (AWS RDS / DigitalOcean managed).

S3 for assets + CloudFront CDN.

Redis for sessions & job queue (Bull).

CI/CD: GitHub Actions for test & deploy.

15. Notifications & scheduling details

Realtime in-app via Socket.IO.

On booking create: emit booking:created to user and admin channels.

Reminder scheduler: background job (cron/Bull) checks upcoming trips and sends reminders at configured intervals (7d, 3d, 24h).

Admin and user notification templates manageable via admin panel.

16. Business rules & constraints (explicit)

Payment method: Pay on Arrival only (display clearly in booking UI).

Booking must be completed ≥ 15 days before trip start date — enforced client & server side.

Cancellation / refund policies configurable in admin; reflected in booking confirmations.

17. Deliverables

Wireframes for Homepage, Search results, Package details, Booking flow, Dashboard, Admin panel.

API spec (OpenAPI/Swagger).

Database schema SQL / migrations.

Source code with layered architecture and tests.

Deployment scripts / docs.

Admin user manual for content & booking management.

18. Minimal MVP scope (recommended)

Homepage (search + hero + featured).

Search & filters.

Package detail with gallery, itinerary, price options.

Booking flow (pay on arrival, 15-day rule), PDF invoice, email/WhatsApp confirmation.

User dashboard (bookings + wishlist).

Admin panel for packages and bookings.

Realtime notifications: booking created + admin alert.

Blog basic CMS.
Deliver MVP first, then add multi-language, loyalty program, seasonal pack templates.

19. Implementation notes & suggestions

Use React with component library or Tailwind for fast, consistent UI.

Backend: Node.js + Express + TypeScript for maintainability.

ORM: TypeORM or Prisma (good Postgres support).

JWT auth + refresh tokens, role-based access control for admin.

Use PDFKit or Puppeteer for server-side invoice PDF generation.

Use Sentry for error tracking, Prometheus + Grafana or hosted alternatives for monitoring.

20. Acceptance criteria (project-level)

Core flows (search → view → book) work end-to-end in staging.

Booking rule (15 days) enforced and tested.

Realtime notifications function for at least bookings and status changes.

Admin can manage packages & bookings.

Secure deployment with HTTPS and environment-based secrets.