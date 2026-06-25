# FindIt Pro — Smart Lost & Found Hub

FindIt Pro is a static, interactive lost and found management system for communities, schools, universities, offices, and public spaces. Users can report lost and found items, review possible matches, track open/resolved cases, and export report data.

This project is built using HTML, CSS, JavaScript, and LocalStorage. It can be deployed directly using GitHub Pages without GitHub Actions.

## Live Demo

Live project: https://danishzulkafli.github.io/findit-pro/

## Features

- Lost item report form
- Found item report form
- Category and priority selection
- Location, date, time, and contact tracking
- Optional photo/reference link
- AI-style match suggestions
- Match scoring by item name, category, location, date, and keywords
- Mark both matched reports as resolved
- Open, resolved, and flagged case statuses
- Recovery score dashboard
- Total reports, lost items, found items, matches, open cases, resolved cases, urgent reports, and categories
- AI-style case management insight
- Category breakdown chart
- Search reports
- Filter by report type
- Filter by category
- Filter by status
- Copy public notice template
- Copy contact message template
- Flag open cases older than 14 days
- Export reports as CSV
- Export reports as JSON
- Print report
- Load sample data
- Reset data
- LocalStorage persistence
- Responsive interface
- GitHub Pages deployment without GitHub Actions

## Matching Logic

The system calculates possible matches using:

- Same category
- Similar item name
- Matching description keywords
- Similar location
- Close date range
- Urgent report priority

## Tech Stack

- HTML
- CSS
- JavaScript
- LocalStorage
- GitHub Pages

## Use Cases

FindIt Pro can be used by:

- Universities
- Schools
- Offices
- Coworking spaces
- Events
- Hostels
- Libraries
- Community centers

## Important Note

This app stores data in the browser using LocalStorage. It is suitable for portfolio, demo, and small-scale static use. For real production use, a backend database and proper authentication should be added.

## Future Improvements

- Admin login
- Real database integration
- Image upload
- QR code for item reports
- Email/SMS notification
- Public claim form
- Claim verification workflow
- Multi-location dashboard
- PWA offline mode
- PDF report export

## Author

Muhammad Danish Zulkafli  
GitHub: https://github.com/DanishZulkafli
