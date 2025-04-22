document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------
  // Accordion Functionality
  // -------------------------------
  // For each card title that contains an accordion icon, toggle the corresponding accordion-content
  const accordionHeaders = document.querySelectorAll(".card-title");
  accordionHeaders.forEach(function (header) {
    // Find the accordion icon and the associated content element
    const accordionIcon = header.querySelector(".accordion-icon");
    // Look for .accordion-content within the same card body
    const accordionContent =
      header.parentElement.querySelector(".accordion-content");

    if (accordionIcon && accordionContent) {
      // Hide content initially if the parent card is not marked as active
      if (!header.closest(".control-group").classList.contains("active")) {
        accordionContent.style.display = "none";
      }

      // Toggle accordion content on header click
      header.addEventListener("click", function () {
        if (accordionContent.style.display === "none") {
          accordionContent.style.display = "block";
          header.closest(".control-group").classList.add("active");
        } else {
          accordionContent.style.display = "none";
          header.closest(".control-group").classList.remove("active");
        }
      });
    }
  });

  // -------------------------------
  // Slider Value Updates
  // -------------------------------
  // Update the displayed slider value as the user adjusts any slider
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(function (slider) {
    slider.addEventListener("input", function () {
      // Assumes the accompanying span has an ID matching the slider's ID with "-value" appended
      const sliderValueElement = document.getElementById(slider.id + "-value");
      if (sliderValueElement) {
        sliderValueElement.textContent = slider.value;
      }
    });
  });

  // -------------------------------
  // Color Picker Updates
  // -------------------------------
  // When a color picker changes, update its corresponding text input and preview box
  const colorPickers = document.querySelectorAll('input[type="color"]');
  colorPickers.forEach(function (picker) {
    picker.addEventListener("input", function () {
      // Assumes that the text input and preview element IDs are based on the picker ID without "-picker"
      const baseId = picker.id.replace("-picker", "");
      const textInput = document.getElementById(baseId);
      const preview = document.getElementById(baseId + "-preview");
      if (textInput) textInput.value = picker.value;
      if (preview) preview.style.backgroundColor = picker.value;
    });
  });

  // Also update the color picker when the corresponding text input changes
  const colorTextInputs = document.querySelectorAll(
    'input[type="text"].form-control'
  );
  colorTextInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      const colorPicker = document.getElementById(input.id + "-picker");
      const preview = document.getElementById(input.id + "-preview");
      if (colorPicker) colorPicker.value = input.value;
      if (preview) preview.style.backgroundColor = input.value;
    });
  });

  // -------------------------------
  // Date Selector Population
  // -------------------------------
  // Populate the year and day selects for the birthdate input
  const yearSelect = document.getElementById("year-input");
  const daySelect = document.getElementById("day-input");
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    // Populate the last 100 years
    for (let i = currentYear; i >= currentYear - 100; i--) {
      const option = document.createElement("option");
      option.value = i;
      option.text = i;
      yearSelect.appendChild(option);
    }
  }
  if (daySelect) {
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i < 10 ? "0" + i : i;
      option.text = i < 10 ? "0" + i : i;
      daySelect.appendChild(option);
    }
  }

  // -------------------------------
  // Additional Functionality Placeholders
  // -------------------------------
  // You can add further event handlers here for buttons like "Calculate",
  // "Export", "Reset Zoom", etc., as needed for your application.
});
