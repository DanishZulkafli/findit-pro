const STORAGE_KEY = "findit-pro-reports";

const sampleReports = [
  {
    id: 1,
    type: "Lost Item",
    name: "Black Wallet",
    category: "Wallet / Money",
    location: "Library Level 2",
    date: "2026-05-20",
    time: "14:30",
    priority: "High",
    contact: "studentA@email.com",
    description: "Black leather wallet with student card and bank card inside",
    photoUrl: "",
    status: "Open",
    createdAt: "2026-05-20T14:30:00.000Z"
  },
  {
    id: 2,
    type: "Found Item",
    name: "Leather Wallet",
    category: "Wallet / Money",
    location: "Library",
    date: "2026-05-21",
    time: "10:15",
    priority: "Normal",
    contact: "security counter",
    description: "Found black leather wallet near study table with cards inside",
    photoUrl: "",
    status: "Open",
    createdAt: "2026-05-21T10:15:00.000Z"
  },
  {
    id: 3,
    type: "Lost Item",
    name: "Student ID Card",
    category: "ID / Card",
    location: "Cafeteria",
    date: "2026-05-22",
    time: "12:00",
    priority: "Urgent",
    contact: "0123456789",
    description: "Lost student ID card with blue lanyard",
    photoUrl: "",
    status: "Open",
    createdAt: "2026-05-22T12:00:00.000Z"
  },
  {
    id: 4,
    type: "Found Item",
    name: "Blue Lanyard ID",
    category: "ID / Card",
    location: "Cafeteria entrance",
    date: "2026-05-22",
    time: "12:40",
    priority: "Normal",
    contact: "admin office",
    description: "Found ID card attached to blue lanyard",
    photoUrl: "",
    status: "Open",
    createdAt: "2026-05-22T12:40:00.000Z"
  }
];

function getReports() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function scrollToReportForm() {
  document.getElementById("reportForm").scrollIntoView({
    behavior: "smooth"
  });
}

function submitReport() {
  const type = document.getElementById("reportType").value;
  const name = document.getElementById("itemName").value.trim();
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const priority = document.getElementById("priority").value;
  const contact = document.getElementById("contact").value.trim();
  const description = document.getElementById("description").value.trim();
  const photoUrl = document.getElementById("photoUrl").value.trim();

  if (!name || !location || !date || !contact || !description) {
    alert("Please fill in item name, location, date, contact info, and description.");
    return;
  }

  const reports = getReports();

  reports.unshift({
    id: Date.now(),
    type,
    name,
    category,
    location,
    date,
    time,
    priority,
    contact,
    description,
    photoUrl,
    status: "Open",
    createdAt: new Date().toISOString()
  });

  saveReports(reports);
  clearForm();
  renderApp();
}

function clearForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("location").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("contact").value = "";
  document.getElementById("description").value = "";
  document.getElementById("photoUrl").value = "";
}

function loadSampleData() {
  const freshSamples = sampleReports.map(report => ({
    ...report,
    id: Date.now() + report.id
  }));

  saveReports(freshSamples);
  renderApp();
}

function resetAllData() {
  const confirmed = confirm("Reset all FindIt data?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderApp();
}

function deleteReport(id) {
  const confirmed = confirm("Delete this report?");
  if (!confirmed) return;

  const reports = getReports().filter(report => report.id !== id);
  saveReports(reports);
  renderApp();
}

function updateStatus(id, status) {
  const reports = getReports().map(report => {
    if (report.id === id) {
      return {
        ...report,
        status,
        resolvedAt: status === "Resolved" ? new Date().toISOString() : report.resolvedAt
      };
    }

    return report;
  });

  saveReports(reports);
  renderApp();
}

function markMatchResolved(lostId, foundId) {
  const reports = getReports().map(report => {
    if (report.id === lostId || report.id === foundId) {
      return {
        ...report,
        status: "Resolved",
        resolvedAt: new Date().toISOString()
      };
    }

    return report;
  });

  saveReports(reports);
  renderApp();
}

function getDateDifferenceScore(dateA, dateB) {
  if (!dateA || !dateB) return 0;

  const diff = Math.abs(new Date(dateA) - new Date(dateB));
  const days = diff / (1000 * 60 * 60 * 24);

  if (days <= 1) return 15;
  if (days <= 3) return 10;
  if (days <= 7) return 5;

  return 0;
}

function getLocationScore(a, b) {
  const locA = tokenize(a.location);
  const locB = tokenize(b.location);
  const overlap = locA.filter(word => locB.includes(word));

  if (normalizeText(a.location) === normalizeText(b.location)) return 20;
  if (overlap.length > 0) return 12;

  return 0;
}

function calculateMatch(lost, found) {
  let score = 0;
  const reasons = [];

  if (lost.category === found.category) {
    score += 25;
    reasons.push("Same category");
  }

  const lostNameTokens = tokenize(lost.name);
  const foundNameTokens = tokenize(found.name);
  const nameOverlap = lostNameTokens.filter(word => foundNameTokens.includes(word));

  if (normalizeText(lost.name) === normalizeText(found.name)) {
    score += 25;
    reasons.push("Exact item name match");
  } else if (nameOverlap.length > 0) {
    score += Math.min(18, nameOverlap.length * 9);
    reasons.push(`Similar item name: ${nameOverlap.join(", ")}`);
  }

  const lostDescriptionTokens = tokenize(lost.description);
  const foundDescriptionTokens = tokenize(found.description);
  const keywordOverlap = lostDescriptionTokens.filter(word => foundDescriptionTokens.includes(word));

  if (keywordOverlap.length > 0) {
    score += Math.min(25, keywordOverlap.length * 5);
    reasons.push(`Matching keywords: ${keywordOverlap.slice(0, 6).join(", ")}`);
  }

  const locationScore = getLocationScore(lost, found);
  if (locationScore > 0) {
    score += locationScore;
    reasons.push("Similar location");
  }

  const dateScore = getDateDifferenceScore(lost.date, found.date);
  if (dateScore > 0) {
    score += dateScore;
    reasons.push("Close date range");
  }

  if (lost.priority === "Urgent") {
    score += 5;
    reasons.push("Urgent lost report");
  }

  return {
    lost,
    found,
    score: Math.min(100, score),
    reasons
  };
}

function getMatches(reports) {
  const lostItems = reports.filter(report => report.type === "Lost Item" && report.status === "Open");
  const foundItems = reports.filter(report => report.type === "Found Item" && report.status === "Open");
  const matches = [];

  lostItems.forEach(lost => {
    foundItems.forEach(found => {
      const match = calculateMatch(lost, found);

      if (match.score >= 45) {
        matches.push(match);
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score);
}

function calculateRecoveryScore(reports, matches) {
  if (reports.length === 0) return 0;

  const resolved = reports.filter(report => report.status === "Resolved").length;
  const open = reports.filter(report => report.status === "Open").length;
  const found = reports.filter(report => report.type === "Found Item").length;

  let score = 0;

  score += Math.min(35, resolved * 12);
  score += Math.min(25, matches.length * 8);
  score += Math.min(20, found * 5);
  score += open > 0 ? 10 : 20;

  return Math.min(100, Math.round(score));
}

function renderDashboard(reports, matches) {
  const total = reports.length;
  const lost = reports.filter(report => report.type === "Lost Item").length;
  const found = reports.filter(report => report.type === "Found Item").length;
  const open = reports.filter(report => report.status === "Open").length;
  const resolved = reports.filter(report => report.status === "Resolved").length;
  const urgent = reports.filter(report => report.priority === "Urgent" && report.status === "Open").length;
  const categories = new Set(reports.map(report => report.category)).size;
  const score = calculateRecoveryScore(reports, matches);

  document.getElementById("totalReports").textContent = total;
  document.getElementById("lostItems").textContent = lost;
  document.getElementById("foundItems").textContent = found;
  document.getElementById("possibleMatches").textContent = matches.length;
  document.getElementById("openCases").textContent = open;
  document.getElementById("resolvedCases").textContent = resolved;
  document.getElementById("urgentReports").textContent = urgent;
  document.getElementById("categoryCount").textContent = categories;
  document.getElementById("recoveryScore").textContent = `${score}%`;
  document.getElementById("recoveryBar").style.width = `${score}%`;

  if (total === 0) {
    document.getElementById("recoveryInsight").textContent = "Start by adding reports.";
  } else if (matches.length > 0) {
    document.getElementById("recoveryInsight").textContent = `${matches.length} possible match${matches.length > 1 ? "es" : ""} found.`;
  } else if (open > 0) {
    document.getElementById("recoveryInsight").textContent = "Open reports available for review.";
  } else {
    document.getElementById("recoveryInsight").textContent = "All cases are resolved.";
  }
}

function renderMatches(matches) {
  const box = document.getElementById("matchesList");

  if (matches.length === 0) {
    box.innerHTML = `
      <div class="empty-box">
        <h3>No matches yet</h3>
        <p>Add both lost and found reports to generate possible matches.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = matches.slice(0, 6).map(match => `
    <div class="match-card">
      <div class="match-score">${match.score}% Match</div>
      <p>${match.reasons.map(escapeHTML).join(" · ")}</p>

      <div class="match-grid">
        <div class="mini-card">
          <span class="pill lost">Lost</span>
          <h3>${escapeHTML(match.lost.name)}</h3>
          <p><strong>Category:</strong> ${escapeHTML(match.lost.category)}</p>
          <p><strong>Location:</strong> ${escapeHTML(match.lost.location)}</p>
          <p><strong>Date:</strong> ${escapeHTML(match.lost.date)}</p>
          <p><strong>Contact:</strong> ${escapeHTML(match.lost.contact)}</p>
        </div>

        <div class="mini-card">
          <span class="pill found">Found</span>
          <h3>${escapeHTML(match.found.name)}</h3>
          <p><strong>Category:</strong> ${escapeHTML(match.found.category)}</p>
          <p><strong>Location:</strong> ${escapeHTML(match.found.location)}</p>
          <p><strong>Date:</strong> ${escapeHTML(match.found.date)}</p>
          <p><strong>Contact:</strong> ${escapeHTML(match.found.contact)}</p>
        </div>
      </div>

      <button onclick="markMatchResolved(${match.lost.id}, ${match.found.id})">Mark Both as Resolved</button>
    </div>
  `).join("");
}

function getAIInsight(reports, matches) {
  if (reports.length === 0) {
    return {
      title: "No insight yet",
      text: "Add reports to receive AI-style next action suggestions."
    };
  }

  const urgent = reports.filter(report => report.priority === "Urgent" && report.status === "Open").length;
  const openLost = reports.filter(report => report.type === "Lost Item" && report.status === "Open").length;
  const openFound = reports.filter(report => report.type === "Found Item" && report.status === "Open").length;

  if (matches.some(match => match.score >= 80)) {
    return {
      title: "High-confidence match detected",
      text: "Review the top match first and verify ownership using unique details before returning the item."
    };
  }

  if (urgent > 0) {
    return {
      title: "Urgent reports need attention",
      text: `${urgent} urgent open report${urgent > 1 ? "s" : ""} found. Prioritize ID cards, wallets, phones, and keys.`
    };
  }

  if (openLost > openFound) {
    return {
      title: "More lost reports than found items",
      text: "Encourage staff or community members to submit found items quickly so matching can improve."
    };
  }

  if (openFound > 0 && openLost === 0) {
    return {
      title: "Found items waiting for owners",
      text: "Publish a safe notice without exposing sensitive item details. Ask claimants to verify unique information."
    };
  }

  return {
    title: "Community report flow is active",
    text: "Continue reviewing matches, updating statuses, and keeping contact information clear."
  };
}

function renderInsight(reports, matches) {
  const insight = getAIInsight(reports, matches);

  document.getElementById("aiTitle").textContent = insight.title;
  document.getElementById("aiText").textContent = insight.text;
}

function renderCategoryBreakdown(reports) {
  const box = document.getElementById("categoryBreakdown");
  const stats = {};

  reports.forEach(report => {
    stats[report.category] = (stats[report.category] || 0) + 1;
  });

  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    box.innerHTML = `<p class="muted">No category data yet.</p>`;
    return;
  }

  const max = Math.max(...entries.map(item => item[1]));

  box.innerHTML = entries.map(([category, count]) => {
    const percentage = Math.round((count / max) * 100);

    return `
      <div class="bar-row">
        <div>
          <span>${escapeHTML(category)}</span>
          <small>${count} reports</small>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function updateCategoryFilter(reports) {
  const filter = document.getElementById("filterCategory");
  const current = filter.value;
  const categories = ["All Categories", ...new Set(reports.map(report => report.category))];

  filter.innerHTML = categories.map(category => `<option>${escapeHTML(category)}</option>`).join("");

  if (categories.includes(current)) {
    filter.value = current;
  }
}

function renderReports(reports) {
  const box = document.getElementById("reportsList");
  const search = normalizeText(document.getElementById("searchInput").value);
  const typeFilter = document.getElementById("filterType").value;
  const categoryFilter = document.getElementById("filterCategory").value;
  const statusFilter = document.getElementById("filterStatus").value;

  let filtered = reports;

  if (typeFilter !== "All Types") {
    filtered = filtered.filter(report => report.type === typeFilter);
  }

  if (categoryFilter !== "All Categories") {
    filtered = filtered.filter(report => report.category === categoryFilter);
  }

  if (statusFilter !== "All Status") {
    filtered = filtered.filter(report => report.status === statusFilter);
  }

  if (search) {
    filtered = filtered.filter(report => {
      const combined = `${report.name} ${report.category} ${report.location} ${report.description} ${report.contact}`.toLowerCase();
      return combined.includes(search);
    });
  }

  if (filtered.length === 0) {
    box.innerHTML = `
      <div class="empty-box wide">
        <h3>No reports found</h3>
        <p>Add reports or adjust your search/filter.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = filtered.map(report => `
    <article class="report-card ${report.type === "Lost Item" ? "lost" : "found"} ${report.status.toLowerCase()}">
      <span class="pill ${report.type === "Lost Item" ? "lost" : "found"}">${escapeHTML(report.type.replace(" Item", ""))}</span>
      <span class="pill">${escapeHTML(report.category)}</span>
      <span class="pill ${report.status.toLowerCase()}">${escapeHTML(report.status)}</span>
      ${report.priority === "Urgent" ? `<span class="pill urgent">Urgent</span>` : ""}

      <h3>${escapeHTML(report.name)}</h3>
      <p><strong>Location:</strong> ${escapeHTML(report.location)}</p>
      <p><strong>Date:</strong> ${escapeHTML(report.date)} ${report.time ? `at ${escapeHTML(report.time)}` : ""}</p>
      <p><strong>Contact:</strong> ${escapeHTML(report.contact)}</p>
      <p>${escapeHTML(report.description)}</p>
      ${report.photoUrl ? `<p><strong>Reference:</strong> <a href="${escapeHTML(report.photoUrl)}" target="_blank" rel="noopener">Open link</a></p>` : ""}

      <div class="report-actions">
        <button onclick="updateStatus(${report.id}, 'Resolved')">Mark Resolved</button>
        <button class="secondary" onclick="updateStatus(${report.id}, 'Flagged')">Flag</button>
        <button class="danger" onclick="deleteReport(${report.id})">Delete</button>
      </div>
    </article>
  `).join("");
}

function copyNoticeTemplate() {
  const text = `Lost & Found Notice

An item has been reported in our community lost and found system. If you believe it belongs to you, please contact the responsible office/counter and provide clear proof of ownership such as item details, location, date, or unique identifiers.

For privacy and safety, please do not share sensitive personal information publicly.`;

  navigator.clipboard.writeText(text)
    .then(() => alert("Notice template copied."))
    .catch(() => alert("Unable to copy. Please copy manually."));
}

function copyContactMessage() {
  const text = `Hi, we found a possible match for your lost/found item report. Please confirm the item details, location, date, and any unique identifiers before collection. Thank you.`;

  navigator.clipboard.writeText(text)
    .then(() => alert("Contact message copied."))
    .catch(() => alert("Unable to copy. Please copy manually."));
}

function markOldOpenCases() {
  const now = new Date();

  const reports = getReports().map(report => {
    const ageDays = (now - new Date(report.date)) / (1000 * 60 * 60 * 24);

    if (report.status === "Open" && ageDays > 14) {
      return {
        ...report,
        status: "Flagged"
      };
    }

    return report;
  });

  saveReports(reports);
  renderApp();
  alert("Open cases older than 14 days have been flagged.");
}

function exportCSV() {
  const reports = getReports();

  if (reports.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = [
    "Type",
    "Name",
    "Category",
    "Location",
    "Date",
    "Time",
    "Priority",
    "Contact",
    "Description",
    "Status"
  ];

  const rows = reports.map(report => [
    report.type,
    report.name,
    report.category,
    report.location,
    report.date,
    report.time || "",
    report.priority,
    report.contact,
    report.description,
    report.status
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  downloadFile(csv, "findit-lost-found-reports.csv", "text/csv");
}

function exportJSON() {
  const reports = getReports();

  if (reports.length === 0) {
    alert("No data to export.");
    return;
  }

  downloadFile(
    JSON.stringify(reports, null, 2),
    "findit-lost-found-reports.json",
    "application/json"
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function printReport() {
  window.print();
}

function renderApp() {
  const reports = getReports();
  const matches = getMatches(reports);

  updateCategoryFilter(reports);
  renderDashboard(reports, matches);
  renderMatches(matches);
  renderInsight(reports, matches);
  renderCategoryBreakdown(reports);
  renderReports(reports);
}

renderApp();
