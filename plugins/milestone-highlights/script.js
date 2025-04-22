document.addEventListener("DOMContentLoaded", () => {
  /* ———  Grab elements  ——— */
  const anniversaryInput = document.getElementById("anniversary");
  const intervalInput = document.getElementById("interval");
  const yearsInput = document.getElementById("years");
  const highlightBtn = document.getElementById("highlight-btn");

  const initialMsg = document.getElementById("initial-message");
  const resultsSection = document.getElementById("results");
  const milestoneList = document.getElementById("milestone-list");
  const exportBtn = document.getElementById("export-ics-btn");
  let icsUrl = null; // will hold the Blob URL

  /* ———  Default values (requested)  ——— */
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY‑MM‑DD
  anniversaryInput.value = todayStr;
  intervalInput.value = "100";
  yearsInput.value = "100";

  /* ———  Enable / disable button when inputs are valid  ——— */
  const toggleButtonState = () => {
    highlightBtn.disabled = !(
      anniversaryInput.value &&
      intervalInput.value &&
      yearsInput.value
    );
  };
  [anniversaryInput, intervalInput, yearsInput].forEach((el) =>
    el.addEventListener("input", toggleButtonState)
  );
  toggleButtonState(); // run once on load

  /* ———  Helpers  ——— */
  const addMonths = (date, n) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    return d;
  };
  const dateISO = (d) => d.toISOString().slice(0, 10); // YYYY‑MM‑DD

  /* ———  Main calculation  ——— */
  highlightBtn.addEventListener("click", () => {
    const startDate = new Date(anniversaryInput.value);
    const interval = parseInt(intervalInput.value, 10); // days
    const totalYears = parseInt(yearsInput.value, 10);

    if (isNaN(interval) || isNaN(totalYears)) return;

    /* 1) Build monthly anniversary list */
    const monthlyDates = [];
    const monthIndex = new Map(); // dateStr → 1‑based month count
    for (let m = 1; m <= totalYears * 12; m++) {
      const dStr = dateISO(addMonths(startDate, m));
      monthlyDates.push(dStr);
      monthIndex.set(dStr, m);
    }

    /* 2) Build milestone‑interval list */
    const milestoneDates = new Set();
    const endDate = addMonths(startDate, totalYears * 12);

    for (let n = 1; ; n++) {
      const dayOffset = n * interval - 1;
      const d = new Date(startDate.getTime() + dayOffset * 86_400_000);
      if (d > endDate) break;
      milestoneDates.add(dateISO(d));
    }

    /* 3) Intersection → matching dates */
    const matches = monthlyDates.filter((d) => milestoneDates.has(d));

    /* 4) Render results */
    milestoneList.innerHTML = ""; // keep the card shell, just clear the list

    if (matches.length === 0) {
      milestoneList.innerHTML =
        '<li class="py-3 text-gray-600">No matching milestones found for this range.</li>';
    } else {
      matches.forEach((dStr) => {
        const monthsPassed = monthIndex.get(dStr);
        const milestoneCount = Math.floor(
          (new Date(dStr) - startDate) / (interval * 86_400_000) + 1
        );
        const milestoneDays = (milestoneCount * interval).toLocaleString(
          "en-US"
        );

        const li = document.createElement("li");
        li.className = "py-3 sm:py-4";
        li.innerHTML = `
      <div class="flex items-center">
        <div class="shrink-0">
          <i class="fas fa-medal text-blue-600 text-lg"></i>      <!-- icon -->
        </div>
        <div class="flex-1 min-w-0 ms-4">
          <p class="text-sm font-medium text-gray-900 truncate">
            ${dStr}                                            <!-- date -->
          </p>
          <p class="text-sm text-gray-500 truncate">
            Month #${monthsPassed}   <!-- total months -->
          </p>
        </div>
        <div class="inline-flex items-center text-base font-semibold text-gray-900">
          ${milestoneDays}&nbsp;days    <!-- milestone day -->
        </div>
      </div>`;
        milestoneList.appendChild(li);
      });
    }

    /* 5) Build / toggle the ICS download link ---------------------------- */
    if (icsUrl) {
      URL.revokeObjectURL(icsUrl); // clean up previous Blob
      icsUrl = null;
    }

    if (matches.length === 0) {
      exportBtn.classList.add("hidden");
    } else {
      const fmtDate = (s) => s.replace(/-/g, ""); // YYYYMMDD
      const dtstamp =
        new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

      let ics =
        "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Milestone Anniversary Finder//EN\r\n";

      matches.forEach((dStr, idx) => {
        const monthsPassed = monthIndex.get(dStr);
        const milestoneCount =
          Math.floor((new Date(dStr) - startDate) / (interval * 86_400_000)) +
          1;
        const daysTotal = milestoneCount * interval;

        ics +=
          [
            "BEGIN:VEVENT",
            `UID:${Date.now()}-${idx}@milestone-finder`,
            `DTSTAMP:${dtstamp}`,
            `SUMMARY:[Milestone] ${daysTotal} days - (Month #${monthsPassed})`,
            `DTSTART;VALUE=DATE:${fmtDate(dStr)}`,
            "END:VEVENT",
          ].join("\r\n") + "\r\n";
      });

      ics += "END:VCALENDAR\r\n";

      icsUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      exportBtn.href = icsUrl;
      exportBtn.classList.remove("hidden");
    }

    /* 6) Toggle visibility of results ----------------------------------- */
    initialMsg.classList.add("hidden");
    resultsSection.classList.remove("hidden");
  });
});
