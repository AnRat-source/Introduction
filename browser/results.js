const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
const heading = document.getElementById("queryHeading");
const status = document.getElementById("status");
const results = document.getElementById("results");

function addText(element, className, value) {
  if (!value) return;
  const child = document.createElement("p");
  child.className = className;
  child.textContent = value;
  element.append(child);
}

function showError(message) {
  status.textContent = "Search unavailable.";
  const item = document.createElement("li");
  item.className = "error";
  item.textContent = message;
  results.replaceChildren(item);
}

async function loadResults() {
  if (!query) {
    heading.textContent = "Search the web";
    status.textContent = "Enter a query in the browser search bar.";
    return;
  }

  heading.textContent = query;
  try {
    const response = await fetch("https://api.anrat.link/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The search request failed.");

    const entries = Array.isArray(payload.results) ? payload.results : [];
    status.textContent = entries.length ? `${entries.length} result${entries.length === 1 ? "" : "s"} found.` : "No results found.";
    const cards = entries.map(result => {
      const item = document.createElement("li");
      item.className = "result";
      const link = document.createElement("a");
      link.href = result.url;
      link.target = "_top";
      link.rel = "noopener noreferrer";
      link.textContent = result.title || result.url;
      item.append(link);
      addText(item, "url", result.url);
      addText(item, "snippet", result.snippet);
      addText(item, "date", result.datePublished);
      return item;
    });
    results.replaceChildren(...cards);
  } catch (error) {
    showError(error instanceof Error ? error.message : "The search request failed.");
  }
}

loadResults();
