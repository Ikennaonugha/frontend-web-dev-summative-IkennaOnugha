📚 Campus Life Planner

The Campus Life Planner is a client-side application designed to help students manage their academic and extracurricular commitments. It allows users to track assignments, study sessions, meeting times, and personal goals, leveraging local storage for data persistence and advanced regular expressions for powerful search and data validation.
Youtube video:https://youtu.be/TybM1cPdhF4

✨ Features

This application is built using vanilla HTML, CSS (Flexbox and custom styling), and JavaScript (ES Modules), with a strong focus on responsiveness and accessibility.

Data & Persistence

Data Model: Each record includes a unique id, title, dueDate (YYYY-MM-DD), duration (in minutes), tag, createdAt, and updatedAt.

Auto-Save: All state changes are automatically persisted to localStorage.

Import/Export: Data can be imported and exported as a JSON file, with mandatory structure validation upon import.

User Interface & Layout

Sections: Includes dedicated views for About, Dashboard/Stats, Records Table, Add/Edit Form, and Settings.

Responsiveness: Mobile-first design utilizing Flexbox and three media query breakpoints (360px, 768px, 1024px) to ensure optimal viewing on all devices.

Aesthetics: Features at least one tasteful CSS transition/animation (e.g., slide-in panel for forms) for improved UX.

Record Management

Forms & Validation: A dedicated form is used to add and edit records, featuring real-time regex validation.

Table View: All records are displayed in a responsive table (swapping to cards on smaller screens).

Sorting: Records can be sorted dynamically by dueDate, title (A-Z), and duration (asc/desc).

Edit & Delete: Records can be edited inline within the table or deleted with a confirmation prompt.

Stats & Targets

Dashboard Metrics: Displays total number of records, the sum of all tracked duration (in hours and minutes), the top-performing tag, and a simple last-7-days trend chart.

Study Target: Users can set a weekly duration target (in minutes) in the Settings panel. The Dashboard provides an ARIA live update on the remaining time or overage.

Powerful Regex Search

A live search input allows users to filter the table using custom regular expressions.

Includes a case-insensitive toggle.

Search matches are highlighted within the table view using the <mark> tag without disrupting the content flow or accessibility.

🔍 Regex Catalog

All form inputs and the live search functionality are powered by Regular Expressions for data integrity and flexible querying.

Field / Feature

Pattern

Purpose & Example

Title/Description (Form Validation)

^\S(?:.*\S)?$

Mandatory: Prevents records with only spaces, and disallows leading or trailing whitespace. e.g., " Final Exam Study " fails, "Final Exam Study" passes.

Duration (Form Validation)

`^(0

[1-9]\d*)(.\d{1,2})?$`

Due Date (Form Validation)

`^\d{4}-(0[1-9]

1[0-2])-(0[1-9]

Tag (Form Validation)

^[A-Za-z]+(?:[ -][A-Za-z]+)*$

Category: Allows letters, single hyphens, and single spaces between words. e.g., CS-301, Group Meeting.

Advanced Search (Live Search)

\b(\w+)\s+\1\b

Back-Reference: Used to detect and highlight instances of accidental duplicate words in the record title or description. e.g., "Review notes the the night before."

Search Filter (Live Search)

^@tag:\w+

Finds records where the description begins with a specific tag prefix. e.g., searching for @tag:urgent only returns high-priority items.

♿ Accessibility (A11y) & UX Notes

The application adheres to accessibility best practices to ensure all users can interact effectively:

Semantic Structure: Uses HTML5 landmark elements (<header>, <nav>, <main>, <section>, <footer>) to provide clear structure for screen readers.

Keyboard Navigation: All interactive elements (buttons, links, inputs, sort headers) are focusable and operable via keyboard.

Focus Visibility: Custom, highly visible focus rings are provided for all interactive elements to aid keyboard users.

Live Regions: The dashboard utilizes an element with role="status" and aria-live="polite" to non-intrusively announce updates to the study target status (remaining time or overage).

Skip Link: A "Skip to Content" link is available at the top of the page for users navigating with a keyboard or screen reader.

Color Contrast: All text and interactive elements meet WCAG AA standards for contrast.

⌨️ Keyboard Map

Key

Action

Context

Tab / Shift + Tab

Navigate between all focusable elements (links, buttons, inputs).

Global

Enter

Activate focused button/link or submit the active form.

Global

Spacebar

Activate focused button/link.

Global

Escape

Close any active modal dialog or the Add/Edit form panel.

Modal/Form Views
