const listEl = document.getElementById("list");

async function init() {
  try {
    const res = await fetch("posts/logs.json");
    if (!res.ok) throw new Error("Could not load logs");

    const logs = (await res.json()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    if (logs.length === 0) {
      listEl.innerHTML = `<p class="text-[var(--muted)]">No logs at the moment</p>`;
    }

    logs.forEach((log) => {
      const link = document.createElement("a");
      link.href = `#${log.slug}`;
      link.dataset.slug = log.slug;
      link.className =
        "block py-2 border-b border-[var(--overlay)] no-underline text-[var(--foam)] transition-colors duration-200 hover:text-[var(--gold)]";
      link.innerHTML = `
<time data-iso="${log.date}" class="block text-[0.8rem] text-[var(--muted)] mb-0.5">${formatRelativeTime(log.date)}</time>
<span class="text-sm leading-snug">${log.title}</span>
`;
      link.onclick = (e) => {
        e.preventDefault();
        loadPost(log.slug, log.title);
        setActiveLink(log.slug);
        window.history.pushState({}, "", `#${log.slug}`);
      };
      listEl.appendChild(link);
    });

    if (location.hash) {
      const slug = location.hash.slice(1);
      const found = logs.find((l) => l.slug === slug);
      if (found) {
        loadPost(slug, found.title);
        setActiveLink(slug);
      }
    }
  } catch (err) {
    listEl.innerHTML = `<p class="text-[var(--love)]">Oops, could not load logs (${err.message})</p>`;
  }
}

function setActiveLink(slug) {
  listEl.querySelectorAll("a").forEach((a) => {
    const isActive = a.dataset.slug === slug;
    a.classList.toggle("text-[var(--gold)]", isActive);
    a.classList.toggle("text-[var(--foam)]", !isActive);
  });
}

function formatRelativeTime(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m > 1 ? "s" : ""} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }
  if (seconds < 172800) return "Yesterday";

  return new Date(isoString).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

setInterval(() => {
  document.querySelectorAll("time[data-iso]").forEach((el) => {
    el.textContent = formatRelativeTime(el.dataset.iso);
  });
}, 60_000);

async function loadPost(slug, title) {
  const contentEl = document.getElementById("content");
  contentEl.innerHTML = `<p class="text-[var(--muted)]">Loading...</p>`;
  document.title = title;
  try {
    const response = await fetch(`posts/${slug}.md`);
    if (!response.ok) throw new Error("Not found");
    const markdown = await response.text();
    const cleanedMd = markdown.replace(/^---\n([\s\S]*?)\n---\n/, "");
    contentEl.innerHTML = marked.parse(cleanedMd);
  } catch (err) {
    contentEl.innerHTML = `<p class="text-[var(--love)]">Oops, could not load that log (${err.message})</p>`;
  }
}

init();
