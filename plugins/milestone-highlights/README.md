## 🏆 Milestone Highlighter
![image](https://github.com/user-attachments/assets/462d142e-8ff0-41aa-b590-6982c249edc3)

**Milestone Highlighter** is a browser-based tool that helps users identify special milestone anniversaries, where a recurring interval of days aligns with a calendar month, based on a chosen start date. Ideal for tracking recurring events like workouts, sobriety anniversaries, or journaling streaks, this plugin highlights specific monthly anniversaries and lets users export them as calendar events.

### Features

- **Milestone Alignment Detection**: Identifies dates where a specific day-based interval (e.g., every 100 days) aligns with a calendar month from a given anniversary date.
- **Custom Evaluation Range**: Users can define how many years into the future to search for aligned milestones.
- **Calendar Export**: Matched milestones can be exported as a downloadable `.ics` file compatible with calendar apps.
- **Responsive UI with Date Picker**: Includes an intuitive UI with modern design and a datepicker for easy input.
- **Progress Tracking**: Clearly shows how many days and months have passed for each matched milestone.

---

### How to use?

1. **Open the App**: Load the HTML file (`index.html`) in any modern browser.
2. **Enter Details**:
   - **Anniversary Date**: Pick a starting date.
   - **Milestone Interval**: Set the number of days between each milestone (e.g., every 100 days).
   - **Years to Evaluate**: Choose how many years into the future to calculate.
3. **Highlight Milestones**: Click the “Highlight Milestones” button to generate results.
4. **View & Export**: View the list of aligned milestones. If matches are found, click the **Export ICS** link to download calendar events.

---

### Special Requirements

- **JavaScript Enabled**: The app relies on client-side JavaScript; ensure your browser supports and allows JS.
- **Flowbite and Font Awesome**: The interface depends on Flowbite for components and Font Awesome for icons (CDNs are already linked).
- **No Server Needed**: Everything runs locally in the browser, no backend or server setup required.
