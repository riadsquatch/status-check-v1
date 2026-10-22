    // Providers listed here get a live indicator. Add data-status-api="<url>" to any
    // .link whose status page uses the Atlassian Statuspage format
    // (https://<host>/api/v2/status.json). Everything else shows "No live feed".
   
    const REFRESH_MS = 60000;
    const LEVELS = {            // Statuspage "indicator" -> our color
      none:     "ok",
      minor:    "warn",
      major:    "bad",
      critical: "bad"
    };

    function render(link, level, text) {
      let el = link.querySelector(".status");
      if (!el) {
        el = document.createElement("span");
        el.className = "status";
        el.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="label"></span>';
        link.appendChild(el);
      }
      el.dataset.level = level;
      el.querySelector(".label").textContent = text;
    }

    async function check(link) {
      const api = link.dataset.statusApi;
      if (!api) return render(link, "off", "No live feed");
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const res = await fetch(api, { signal: ctrl.signal, cache: "no-store" });
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const level = LEVELS[data.status.indicator] || "warn";
        render(link, level, data.status.description);
      } catch (err) {
        render(link, "off", "Status unavailable");
      } finally {
        clearTimeout(timer);
      }
    }

    function checkAll() {
      document.querySelectorAll(".link").forEach(check);
    }

    document.querySelectorAll(".link").forEach(l =>
      render(l, l.dataset.statusApi ? "loading" : "off",
                l.dataset.statusApi ? "Checking\u2026" : "No live feed"));
    checkAll();
    setInterval(checkAll, REFRESH_MS);
