// Main application class
class StippleApp {
  constructor() {
    // Canvas elements
    this.previewCanvas = document.getElementById("preview-canvas");
    this.previewCtx = this.previewCanvas.getContext("2d");
    this.originalCanvas = document.getElementById("original-canvas");
    this.originalCtx = this.originalCanvas.getContext("2d");
    this.processedCanvas = document.getElementById("processed-canvas");
    this.processedCtx = this.processedCanvas.getContext("2d");

    // DOM elements
    this.fileInput = document.getElementById("file-input");
    this.canvasUploadArea = document.getElementById("canvas-upload-area");
    this.thumbnailGallery = document.getElementById("thumbnail-gallery");
    this.thumbnailUploadBtn = document.getElementById("thumbnail-upload-btn");
    this.statusArea = document.getElementById("status-area");
    this.modalStatusArea = document.getElementById("modal-status-area");
    this.logModalOverlay = document.getElementById("log-modal-overlay");
    this.logModal = document.getElementById("log-modal");
    this.exportModalOverlay = document.getElementById("export-modal-overlay");
    this.exportModal = document.getElementById("export-modal");
    this.manualSettings = document.getElementById("manual-settings");
    this.colorSettings = document.getElementById("color-settings");
    this.comparisonContainer = document.getElementById("comparison-container");
    this.canvasContainer = document.querySelector(".canvas-container");
    this.canvasWrapper = document.querySelector(".canvas-wrapper");
    this.comparisonWrapper = document.querySelector(".comparison-wrapper");
    this.resetZoomBtn = document.getElementById("reset-zoom-btn");

    // Control elements
    this.ditheringMethod = document.getElementById("dithering-method");
    this.thresholdSlider = document.getElementById("threshold-slider");
    this.thresholdValue = document.getElementById("threshold-value");
    this.dotSizeSlider = document.getElementById("dot-size-slider");
    this.dotSizeValue = document.getElementById("dot-size-value");
    this.spacingSlider = document.getElementById("spacing-slider");
    this.spacingValue = document.getElementById("spacing-value");
    this.contrastSlider = document.getElementById("contrast-slider");
    this.contrastValue = document.getElementById("contrast-value");
    this.brightnessSlider = document.getElementById("brightness-slider");
    this.brightnessValue = document.getElementById("brightness-value");
    this.dotShape = document.getElementById("dot-shape");
    this.dotChar = document.getElementById("dot-char");
    this.bgColor = document.getElementById("bg-color");
    this.bgColorPreview = document.getElementById("bg-color-preview");
    this.bgColorPicker = document.getElementById("bg-color-picker");
    this.dotColor = document.getElementById("dot-color");
    this.dotColorPreview = document.getElementById("dot-color-preview");
    this.dotColorPicker = document.getElementById("dot-color-picker");
    this.exportWithBg = document.getElementById("export-with-bg");
    this.reverseColors = document.getElementById("reverse-colors");
    this.colorMode = document.getElementById("color-mode");
    this.exportFormat = document.getElementById("export-format");

    // Buttons
    this.exportBtn = document.getElementById("export-btn");
    this.exportAllBtn = document.getElementById("export-all-btn");
    this.compareBtn = document.getElementById("compare-btn");
    this.downloadBtn = document.getElementById("download-btn");
    this.logBtn = document.getElementById("log-btn");
    this.logModalCloseBtn = document.getElementById("log-modal-close");
    this.exportModalCloseBtn = document.getElementById("export-modal-close");

    // Application state
    this.images = [];
    this.currentImageIndex = -1;
    this.processedImageData = null;
    this.isComparisonMode = false;
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Initialize the application
    this.init();
  }

  init() {
    // Set up event listeners
    this.setupEventListeners();

    // Update UI based on initial values
    this.updateSliderValues();
    this.toggleDotCharInput();
    this.toggleCanvasUploadArea();

    // Initialize accordion sections
    this.initAccordionSections();

    // Initialize manual settings after accordion setup
    this.toggleManualSettings();

    // Set up custom tooltips
    this.setupCustomTooltips();

    // Set up horizontal scrolling for thumbnail gallery
    this.setupHorizontalScroll();

    // Add initial status message
    this.addStatusMessage("Ready. Drag and drop images or click to upload.");
  }

  // Set up horizontal scrolling for thumbnail gallery
  setupHorizontalScroll() {
    if (this.thumbnailGallery) {
      this.thumbnailGallery.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          // Scroll horizontally instead of vertically
          this.thumbnailGallery.scrollLeft += e.deltaY;
        }
      });
    }
  }

  // Initialize accordion sections
  initAccordionSections() {
    // Get all control groups
    const controlGroups = document.querySelectorAll(".control-group");

    // Add event listeners to each control group
    controlGroups.forEach((group) => {
      // Only make the header part clickable for accordion toggle
      const cardTitle = group.querySelector(".card-title");
      if (cardTitle && group.querySelector(".accordion-content")) {
        cardTitle.addEventListener("click", (e) => {
          this.toggleAccordionSection(group);
        });
      }
    });

    // Set initial state - open the first accordion by default
    const firstAccordion = document.querySelector(".control-group");
    if (firstAccordion) {
      firstAccordion.classList.add("active");
    }

    // Set initial state for all accordions
    document.querySelectorAll(".control-group").forEach((group) => {
      const content = group.querySelector(".accordion-content");
      if (content) {
        content.style.display = group.classList.contains("active")
          ? "block"
          : "none";
      }
    });
  }

  // Toggle accordion section
  toggleAccordionSection(section) {
    // Check if this is a manual settings section in non-manual mode
    if (
      section.id === "manual-settings" &&
      this.ditheringMethod.value !== "manual"
    ) {
      return; // Don't toggle if it's manual settings in non-manual mode
    }

    // Check if the section is already active
    const isActive = section.classList.contains("active");

    // If we're trying to close the section and it's the only open one, don't close it
    const activeCount = document.querySelectorAll(
      ".control-group.active"
    ).length;
    if (isActive && activeCount <= 1) {
      return; // Keep at least one section open
    }

    // If we're opening this section, close all others first (regardless of mode)
    if (!isActive) {
      // Close all other accordions
      document.querySelectorAll(".control-group.active").forEach((group) => {
        if (group !== section && group.querySelector(".accordion-content")) {
          group.classList.remove("active");
          const content = group.querySelector(".accordion-content");
          if (content) {
            content.style.display = "none";
          }
        }
      });

      // Make sure this section becomes active
      section.classList.add("active");
    } else {
      // We're closing this section, but only if there's another one to open
      // Find another section to open if this is the only active one
      if (activeCount <= 1) {
        // Find another accordion to open
        const allAccordions = document.querySelectorAll(".control-group");
        let opened = false;

        allAccordions.forEach((group) => {
          // Skip the current section and sections without accordion content
          if (group === section || !group.querySelector(".accordion-content")) {
            return;
          }

          // Skip manual settings in non-manual mode
          if (
            group.id === "manual-settings" &&
            this.ditheringMethod.value !== "manual"
          ) {
            return;
          }

          // Open this accordion if we haven't opened one yet
          if (!opened) {
            group.classList.add("active");
            const content = group.querySelector(".accordion-content");
            if (content) {
              content.style.display = "block";
            }
            opened = true;
          }
        });

        // Only close the current section if we found another one to open
        if (opened) {
          section.classList.remove("active");
        } else {
          // If no other accordion can be opened, keep this one open
          return;
        }
      } else {
        // There are other active accordions, so we can safely close this one
        section.classList.remove("active");
      }
    }

    // Get the accordion content
    const accordionContent = section.querySelector(".accordion-content");

    // Update the content display based on active state
    if (accordionContent) {
      if (section.classList.contains("active")) {
        // Make sure the content is visible when active
        accordionContent.style.display = "block";
      } else {
        // Hide content when not active
        accordionContent.style.display = "none";
      }
    }

    // Add a subtle animation effect
    if (section.classList.contains("active")) {
      section.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";
    }
  }

  // Set up custom tooltips
  setupCustomTooltips() {
    // Create a tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    document.body.appendChild(tooltip);

    // Get all elements with tooltip class
    const tooltipElements = document.querySelectorAll(".tooltip");

    tooltipElements.forEach((element) => {
      const tooltipText = element.getAttribute("data-tooltip");

      element.addEventListener("mouseenter", () => {
        // Set tooltip text
        tooltip.textContent = tooltipText;

        // Position tooltip below the element
        const rect = element.getBoundingClientRect();
        tooltip.style.top = rect.top + rect.height + 5 + "px";
        tooltip.style.left =
          rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";

        // Show tooltip
        tooltip.classList.add("visible");
      });

      element.addEventListener("mouseleave", () => {
        // Hide tooltip
        tooltip.classList.remove("visible");
      });
    });
  }

  // Toggle visibility of canvas upload area based on whether images are loaded
  toggleCanvasUploadArea() {
    if (this.currentImageIndex === -1) {
      // No images loaded, show the upload area
      this.canvasUploadArea.classList.add("active");
    } else {
      // Images loaded, hide the upload area
      this.canvasUploadArea.classList.remove("active");
    }
  }

  setupEventListeners() {
    // File upload events
    this.fileInput.addEventListener("change", (e) =>
      this.handleFileUpload(e.target.files)
    );

    // Canvas upload area events
    this.canvasUploadArea.addEventListener("click", () =>
      this.fileInput.click()
    );

    // Thumbnail upload button event
    this.thumbnailUploadBtn.addEventListener("click", () =>
      this.fileInput.click()
    );

    // Zoom and pan functionality
    this.canvasWrapper.addEventListener("wheel", (e) => this.handleZoom(e));
    this.comparisonWrapper.addEventListener("wheel", (e) => this.handleZoom(e));

    // Mouse events for panning
    this.canvasWrapper.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e)
    );
    this.comparisonWrapper.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e)
    );
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());

    // Reset zoom button
    this.resetZoomBtn.addEventListener("click", () => this.resetZoom());

    // Drag and drop events for canvas container
    this.canvasContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Show drag-over effect on canvas upload area if it's visible
      if (this.canvasUploadArea.classList.contains("active")) {
        this.canvasUploadArea.classList.add("drag-over");
      }
    });

    this.canvasContainer.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.canvasUploadArea.classList.remove("drag-over");
    });

    this.canvasContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.canvasUploadArea.classList.remove("drag-over");

      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files);
      }
    });

    // Control events
    this.ditheringMethod.addEventListener("change", () => {
      this.toggleManualSettings();
      this.processImage();
    });

    // Slider events with debounce
    const sliders = [
      this.thresholdSlider,
      this.dotSizeSlider,
      this.spacingSlider,
      this.contrastSlider,
      this.brightnessSlider,
    ];

    sliders.forEach((slider) => {
      // Prevent event propagation to avoid triggering accordion toggle
      slider.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      slider.addEventListener("input", (e) => {
        e.stopPropagation();
        this.updateSliderValues();
        this.debounceProcessImage();
      });
    });

    // Color inputs
    this.bgColorPreview.addEventListener("click", (e) => {
      e.stopPropagation();
      this.bgColorPicker.click();
    });

    this.bgColorPicker.addEventListener("input", (e) => {
      e.stopPropagation();
      this.bgColor.value = e.target.value;
      this.bgColorPreview.style.backgroundColor = e.target.value;
      this.processImage();
    });

    this.bgColor.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.bgColor.addEventListener("input", (e) => {
      e.stopPropagation();
      const color = this.safeHexColor(e.target.value, "#FFFFFF");
      this.bgColorPreview.style.backgroundColor = color;
      this.bgColorPicker.value = color;
      this.processImage();
    });

    this.dotColorPreview.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dotColorPicker.click();
    });

    this.dotColorPicker.addEventListener("input", (e) => {
      e.stopPropagation();
      this.dotColor.value = e.target.value;
      this.dotColorPreview.style.backgroundColor = e.target.value;
      this.processImage();
    });

    this.dotColor.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.dotColor.addEventListener("input", (e) => {
      e.stopPropagation();
      const color = this.safeHexColor(e.target.value, "#000000");
      this.dotColorPreview.style.backgroundColor = color;
      this.dotColorPicker.value = color;
      this.processImage();
    });

    // Checkbox events
    this.exportWithBg.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.exportWithBg.addEventListener("change", (e) => {
      e.stopPropagation();
      this.processImage();
    });

    this.reverseColors.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.reverseColors.addEventListener("change", (e) => {
      e.stopPropagation();
      this.processImage();
    });

    this.colorMode.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.colorMode.addEventListener("change", (e) => {
      e.stopPropagation();
      this.processImage();
    });

    // Dot shape events
    this.dotShape.addEventListener("change", (e) => {
      // Prevent event propagation to avoid triggering accordion toggle
      e.stopPropagation();
      this.toggleDotCharInput();
      this.processImage();
    });

    this.dotChar.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.dotChar.addEventListener("input", (e) => {
      e.stopPropagation();
      this.processImage();
    });

    // Button events
    this.exportBtn.addEventListener("click", () => this.exportCurrentImage());
    this.exportAllBtn.addEventListener("click", () => this.exportAllImages());
    this.compareBtn.addEventListener("click", () =>
      this.toggleComparisonMode()
    );
    this.downloadBtn.addEventListener("click", () => this.toggleExportModal());
    this.logBtn.addEventListener("click", () => this.toggleLogModal());
    this.logModalCloseBtn.addEventListener("click", () => this.closeLogModal());
    this.exportModalCloseBtn.addEventListener("click", () =>
      this.closeExportModal()
    );

    // Close modals when clicking outside
    this.logModalOverlay.addEventListener("click", (e) => {
      if (e.target === this.logModalOverlay) {
        this.closeLogModal();
      }
    });

    this.exportModalOverlay.addEventListener("click", (e) => {
      if (e.target === this.exportModalOverlay) {
        this.closeExportModal();
      }
    });

    // Window resize event
    window.addEventListener("resize", () => this.handleResize());
  }

  // Debounce function for processing images
  debounceProcessImage() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.processImage();
    }, 100);
  }

  // Update slider value displays
  updateSliderValues() {
    this.thresholdValue.textContent = this.thresholdSlider.value;
    this.dotSizeValue.textContent = this.dotSizeSlider.value;
    this.spacingValue.textContent = this.spacingSlider.value;
    this.contrastValue.textContent = this.contrastSlider.value;
    this.brightnessValue.textContent = this.brightnessSlider.value;
  }

  // Toggle visibility of manual settings based on dithering method
  toggleManualSettings() {
    // Get accordion content elements
    const manualAccordionContent =
      this.manualSettings.querySelector(".accordion-content");
    const colorAccordionContent =
      this.colorSettings.querySelector(".accordion-content");

    if (this.ditheringMethod.value === "manual") {
      // In Manual mode, show manual settings and make both sections function as accordions
      this.manualSettings.style.display = "block";

      // Make sure both sections have proper accordion behavior
      this.manualSettings.classList.add("control-group");
      this.colorSettings.classList.add("control-group");

      // Make sure accordion icons are visible
      const colorHeader = this.colorSettings.querySelector(".accordion-header");
      if (colorHeader) {
        const icon = colorHeader.querySelector(".accordion-icon");
        if (icon) {
          icon.style.display = "";
        }
      }

      // Ensure at least one section is open
      if (
        !this.manualSettings.classList.contains("active") &&
        !this.colorSettings.classList.contains("active")
      ) {
        this.manualSettings.classList.add("active");
      }
    } else {
      // In other modes, hide manual settings and make color settings always open
      this.manualSettings.style.display = "none";

      // Make Color Settings always open in non-manual mode
      this.colorSettings.classList.add("control-group");
      this.colorSettings.classList.add("active");

      // Show the color settings content
      if (colorAccordionContent) {
        colorAccordionContent.style.display = "block";
      }
    }

    // Update accordion content visibility based on active state
    document.querySelectorAll(".control-group").forEach((group) => {
      const content = group.querySelector(".accordion-content");
      if (content) {
        content.style.display = group.classList.contains("active")
          ? "block"
          : "none";
      }
    });
  }

  // Toggle visibility of dot character input based on dot shape
  toggleDotCharInput() {
    if (this.dotShape.value === "character") {
      this.dotChar.classList.add("active");
    } else {
      this.dotChar.classList.remove("active");
    }
  }

  // Handle file upload
  handleFileUpload(files) {
    if (files.length === 0) return;

    this.addStatusMessage(`Loading ${files.length} image(s)...`);

    // Clear existing images if this is a new upload
    if (this.images.length === 0) {
      this.thumbnailGallery.innerHTML = "";
    }

    // Hide the canvas upload area when uploading images
    this.canvasUploadArea.classList.remove("active");

    // Process each file
    Array.from(files).forEach((file, index) => {
      if (!file.type.match("image.*")) {
        this.showToast(
          "Error",
          `File "${file.name}" is not an image.`,
          "error"
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Add image to the collection
          this.images.push({
            name: file.name,
            element: img,
            original: null,
            processed: null,
          });

          // Create thumbnail
          this.createThumbnail(this.images.length - 1);

          // If this is the first image, display it
          if (
            this.currentImageIndex === -1 ||
            (index === 0 && this.images.length === files.length)
          ) {
            this.selectImage(this.images.length - 1);
          }

          this.addStatusMessage(`Loaded "${file.name}"`);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  // Create a thumbnail for an image
  createThumbnail(index) {
    const img = this.images[index].element;
    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";
    thumbnail.dataset.index = index;

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = img.src;
    thumbnail.appendChild(thumbnailImg);

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "thumbnail-delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.title = "Delete image";

    // Add event listener for delete button
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent thumbnail click event
      this.deleteImage(index);
    });

    thumbnail.appendChild(deleteBtn);

    thumbnail.addEventListener("click", () => {
      this.selectImage(index);
    });

    this.thumbnailGallery.appendChild(thumbnail);
  }

  // Delete an image
  deleteImage(index) {
    if (index < 0 || index >= this.images.length) return;

    // Get the name of the image for status message
    const imageName = this.images[index].name;

    // Store the current index before deletion
    const wasCurrentImage = this.currentImageIndex === index;

    // Remove the image from the array
    this.images.splice(index, 1);

    // Clear the thumbnail gallery and recreate all thumbnails with correct indices
    this.thumbnailGallery.innerHTML = "";
    this.images.forEach((image, idx) => {
      this.createThumbnail(idx);
    });

    // Handle selection after deletion
    if (this.images.length === 0) {
      // No images left
      this.currentImageIndex = -1;
      this.toggleCanvasUploadArea();

      // Clear the canvas
      if (this.previewCanvas) {
        this.previewCtx.clearRect(
          0,
          0,
          this.previewCanvas.width,
          this.previewCanvas.height
        );
      }
    } else if (wasCurrentImage) {
      // If we deleted the current image, select a new one
      const newIndex =
        index < this.images.length ? index : this.images.length - 1;
      this.selectImage(newIndex);
    } else if (this.currentImageIndex > index) {
      // If the current image was after the deleted one, update its index
      this.currentImageIndex--;

      // Update the active thumbnail
      const thumbnails = this.thumbnailGallery.querySelectorAll(".thumbnail");
      thumbnails.forEach((thumb) => {
        if (parseInt(thumb.dataset.index) === this.currentImageIndex) {
          thumb.classList.add("active");
        } else {
          thumb.classList.remove("active");
        }
      });
    }

    this.addStatusMessage(`Deleted "${imageName}"`);
    this.showToast("Info", `Deleted "${imageName}"`, "warning");
  }

  // Select an image to display
  selectImage(index) {
    if (index < 0 || index >= this.images.length) return;

    // Update current image index
    this.currentImageIndex = index;

    // Update thumbnail selection
    const thumbnails = this.thumbnailGallery.querySelectorAll(".thumbnail");
    thumbnails.forEach((thumb) => {
      if (parseInt(thumb.dataset.index) === index) {
        thumb.classList.add("active");
      } else {
        thumb.classList.remove("active");
      }
    });

    // Process and display the selected image
    this.processImage();

    // Update canvas upload area visibility
    this.toggleCanvasUploadArea();

    this.addStatusMessage(`Selected "${this.images[index].name}"`);
  }

  // Process the current image with the selected settings
  processImage() {
    if (this.currentImageIndex === -1) return;

    const image = this.images[this.currentImageIndex];
    const img = image.element;

    // Create a canvas for the original image if it doesn't exist
    if (!image.original) {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      image.original = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Calculate the maximum dimensions to fit the canvas container
    const containerWidth = this.canvasWrapper.clientWidth;
    const containerHeight = this.canvasWrapper.clientHeight;

    // Calculate the scale to fit the image within the container
    const scaleX = containerWidth / img.width;
    const scaleY = containerHeight / img.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up images that are smaller than the container

    // Set canvas dimensions to the original image size
    // The CSS will handle the scaling for display
    this.previewCanvas.width = img.width;
    this.previewCanvas.height = img.height;
    this.originalCanvas.width = img.width;
    this.originalCanvas.height = img.height;
    this.processedCanvas.width = img.width;
    this.processedCanvas.height = img.height;

    // Set the canvas display size based on the calculated scale
    this.previewCanvas.style.width = `${img.width * scale}px`;
    this.previewCanvas.style.height = `${img.height * scale}px`;
    this.originalCanvas.style.width = `${(img.width * scale) / 2}px`; // Half width for comparison view
    this.originalCanvas.style.height = `${img.height * scale}px`;
    this.processedCanvas.style.width = `${(img.width * scale) / 2}px`; // Half width for comparison view
    this.processedCanvas.style.height = `${img.height * scale}px`;

    // Draw original image
    this.originalCtx.putImageData(image.original, 0, 0);

    // Get settings
    const method = this.ditheringMethod.value;
    const threshold = parseInt(this.thresholdSlider.value);
    const dotSize = parseFloat(this.dotSizeSlider.value);
    const spacing = parseFloat(this.spacingSlider.value);
    const contrast = parseInt(this.contrastSlider.value) / 10;
    const brightness = parseInt(this.brightnessSlider.value);
    const dotShape = this.dotShape.value;
    const dotChar = this.dotChar.value || "*";
    let bgColor = this.safeHexColor(this.bgColor.value, "#FFFFFF");
    let dotColor = this.safeHexColor(this.dotColor.value, "#000000");

    // Process the image based on the selected method
    let processedData;

    if (method === "manual") {
      processedData = this.applyManualDithering(
        image.original,
        threshold,
        contrast,
        brightness
      );
    } else if (method === "bayer") {
      processedData = this.applyBayerDithering(image.original, threshold);
    } else if (method === "floyd-steinberg") {
      processedData = this.applyFloydSteinbergDithering(
        image.original,
        threshold
      );
    } else if (method === "atkinson") {
      processedData = this.applyAtkinsonDithering(image.original, threshold);
    }

    // Store the processed image data
    image.processed = processedData;
    this.processedImageData = processedData;

    // Render the preview
    this.renderPreview(
      processedData,
      bgColor,
      dotColor,
      dotSize,
      spacing,
      dotShape,
      dotChar
    );

    // Update comparison view if active
    if (this.isComparisonMode) {
      this.updateComparisonView();
    }
  }

  // Render the preview with the processed image data
  renderPreview(
    imageData,
    bgColor,
    dotColor,
    dotSize,
    spacing,
    dotShape,
    dotChar
  ) {
    const width = imageData.width;
    const height = imageData.height;

    // Clear the canvas
    this.previewCtx.clearRect(0, 0, width, height);

    // Fill with background color
    this.previewCtx.fillStyle = bgColor;
    this.previewCtx.fillRect(0, 0, width, height);

    // Set dot color
    this.previewCtx.fillStyle = dotColor;

    // Use color mode if enabled
    const useColorMode = this.colorMode.checked;

    // Draw dots based on the processed image
    if (this.ditheringMethod.value === "manual") {
      // For manual mode, draw dots with spacing
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;

          // Skip if pixel is white (255) - or if pixel is black (0) and colors are reversed
          // When reversed, we place dots where empty spaces were (white pixels) and leave empty where dots were (black pixels)
          if (
            (!this.reverseColors.checked && imageData.data[i] === 255) ||
            (this.reverseColors.checked && imageData.data[i] !== 255)
          )
            continue;

          // Use original color in color mode (overrides other color settings)
          if (useColorMode) {
            const originalIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r =
              this.images[this.currentImageIndex].original.data[originalIndex];
            const g =
              this.images[this.currentImageIndex].original.data[
                originalIndex + 1
              ];
            const b =
              this.images[this.currentImageIndex].original.data[
                originalIndex + 2
              ];
            this.previewCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          }

          // Draw the dot based on the selected shape
          if (dotShape === "circle") {
            this.previewCtx.beginPath();
            this.previewCtx.arc(x, y, dotSize, 0, Math.PI * 2);
            this.previewCtx.fill();
          } else if (dotShape === "square") {
            this.previewCtx.fillRect(
              x - dotSize,
              y - dotSize,
              dotSize * 2,
              dotSize * 2
            );
          } else if (dotShape === "triangle") {
            const side = 2 * dotSize;
            const height = dotSize * Math.sqrt(3);

            this.previewCtx.beginPath();
            this.previewCtx.moveTo(x, y - (2 / 3) * height);
            this.previewCtx.lineTo(x - side / 2, y + (1 / 3) * height);
            this.previewCtx.lineTo(x + side / 2, y + (1 / 3) * height);
            this.previewCtx.closePath();
            this.previewCtx.fill();
          } else if (dotShape === "character") {
            const fontSize = Math.max(dotSize * 2, 8);
            this.previewCtx.font = `${fontSize}px Arial`;
            this.previewCtx.textAlign = "center";
            this.previewCtx.textBaseline = "middle";
            this.previewCtx.fillText(dotChar, x, y);
          }
        }
      }
    } else {
      // For other dithering methods, draw pixel by pixel
      const imageDataCopy = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );

      // Apply color mode if enabled
      if (useColorMode) {
        for (let i = 0; i < imageData.data.length; i += 4) {
          // Determine if this pixel should be a dot or background based on threshold and reverse setting
          // When reversed, we place dots where empty spaces were (white pixels) and leave empty where dots were (black pixels)
          const isDot =
            (!this.reverseColors.checked && imageData.data[i] === 0) ||
            (this.reverseColors.checked && imageData.data[i] === 255);

          if (isDot) {
            // Use original color for dot pixels
            imageDataCopy.data[i] =
              this.images[this.currentImageIndex].original.data[i];
            imageDataCopy.data[i + 1] =
              this.images[this.currentImageIndex].original.data[i + 1];
            imageDataCopy.data[i + 2] =
              this.images[this.currentImageIndex].original.data[i + 2];
          } else {
            // Use background color for non-dot pixels
            const bgRgb = this.hexToRgb(bgColor);
            imageDataCopy.data[i] = bgRgb[0];
            imageDataCopy.data[i + 1] = bgRgb[1];
            imageDataCopy.data[i + 2] = bgRgb[2];
          }
        }
      } else {
        // Use dot color and background color
        const dotRgb = this.hexToRgb(dotColor);
        const bgRgb = this.hexToRgb(bgColor);

        for (let i = 0; i < imageData.data.length; i += 4) {
          // Determine if this pixel should be a dot or background based on threshold and reverse setting
          // When reversed, we place dots where empty spaces were (white pixels) and leave empty where dots were (black pixels)
          const isDot =
            (!this.reverseColors.checked && imageData.data[i] === 0) ||
            (this.reverseColors.checked && imageData.data[i] === 255);

          if (isDot) {
            // Dot pixel
            imageDataCopy.data[i] = dotRgb[0];
            imageDataCopy.data[i + 1] = dotRgb[1];
            imageDataCopy.data[i + 2] = dotRgb[2];
          } else {
            // Background pixel
            imageDataCopy.data[i] = bgRgb[0];
            imageDataCopy.data[i + 1] = bgRgb[1];
            imageDataCopy.data[i + 2] = bgRgb[2];
          }
        }
      }

      this.previewCtx.putImageData(imageDataCopy, 0, 0);
    }

    // Draw the processed image on the processed canvas for comparison
    this.processedCtx.clearRect(0, 0, width, height);
    this.processedCtx.drawImage(this.previewCanvas, 0, 0);
  }

  // Apply manual dithering
  applyManualDithering(imageData, threshold, contrast, brightness) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);

    // Apply contrast and brightness
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Get grayscale value
      const gray =
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

      // Apply contrast and brightness
      let adjusted = gray * contrast + brightness;
      adjusted = Math.max(0, Math.min(255, adjusted));

      // Apply threshold
      const value = adjusted < threshold ? 0 : 255;

      result.data[i] = value;
      result.data[i + 1] = value;
      result.data[i + 2] = value;
      result.data[i + 3] = imageData.data[i + 3]; // Preserve alpha
    }

    return result;
  }

  // Apply Bayer dithering
  applyBayerDithering(imageData, threshold) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);

    // Bayer matrix 4x4
    const bayerMatrix = [
      [15, 135, 45, 165],
      [195, 75, 225, 105],
      [60, 180, 30, 150],
      [240, 120, 210, 90],
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        // Get grayscale value
        const gray =
          (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
          3;

        // Apply Bayer dithering
        const bayerValue = bayerMatrix[y % 4][x % 4];
        const normalized = (gray + bayerValue) / 2;
        const value = normalized < threshold ? 0 : 255;

        result.data[i] = value;
        result.data[i + 1] = value;
        result.data[i + 2] = value;
        result.data[i + 3] = imageData.data[i + 3]; // Preserve alpha
      }
    }

    return result;
  }

  // Apply Floyd-Steinberg dithering
  applyFloydSteinbergDithering(imageData, threshold) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);

    // Create a copy of the image data to work with
    const buffer = new Float32Array(width * height);

    // Convert to grayscale
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      buffer[i] =
        (imageData.data[idx] +
          imageData.data[idx + 1] +
          imageData.data[idx + 2]) /
        3;
    }

    // Apply Floyd-Steinberg dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldPixel = buffer[idx];
        const newPixel = oldPixel < threshold ? 0 : 255;

        buffer[idx] = newPixel;

        const error = oldPixel - newPixel;

        // Distribute error to neighboring pixels
        if (x + 1 < width) {
          buffer[idx + 1] += (error * 7) / 16;
        }

        if (y + 1 < height) {
          if (x > 0) {
            buffer[idx + width - 1] += (error * 3) / 16;
          }

          buffer[idx + width] += (error * 5) / 16;

          if (x + 1 < width) {
            buffer[idx + width + 1] += (error * 1) / 16;
          }
        }
      }
    }

    // Convert buffer back to image data
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const value = Math.max(0, Math.min(255, buffer[i]));

      result.data[idx] = value;
      result.data[idx + 1] = value;
      result.data[idx + 2] = value;
      result.data[idx + 3] = imageData.data[idx + 3]; // Preserve alpha
    }

    return result;
  }

  // Apply Atkinson dithering
  applyAtkinsonDithering(imageData, threshold) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);

    // Create a copy of the image data to work with
    const buffer = new Float32Array(width * height);

    // Convert to grayscale
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      buffer[i] =
        (imageData.data[idx] +
          imageData.data[idx + 1] +
          imageData.data[idx + 2]) /
        3;
    }

    // Apply Atkinson dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldPixel = buffer[idx];
        const newPixel = oldPixel < threshold ? 0 : 255;

        buffer[idx] = newPixel;

        const error = (oldPixel - newPixel) / 8;

        // Distribute error to neighboring pixels
        const neighbors = [
          [x + 1, y],
          [x + 2, y],
          [x - 1, y + 1],
          [x, y + 1],
          [x + 1, y + 1],
          [x, y + 2],
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            buffer[ny * width + nx] += error;
          }
        }
      }
    }

    // Convert buffer back to image data
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const value = Math.max(0, Math.min(255, buffer[i]));

      result.data[idx] = value;
      result.data[idx + 1] = value;
      result.data[idx + 2] = value;
      result.data[idx + 3] = imageData.data[idx + 3]; // Preserve alpha
    }

    return result;
  }

  // Reset zoom level to 1 and pan position to 0,0
  resetZoom() {
    if (this.currentImageIndex === -1) return;

    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;

    // Apply zoom and pan
    if (this.isComparisonMode) {
      this.updateComparisonView();
    } else {
      this.applyZoomAndPan();
    }

    this.addStatusMessage("Zoom reset to 100%");
    this.showToast("Info", "Zoom reset to 100%", "success");
  }

  // Handle zoom with mouse wheel
  handleZoom(e) {
    if (this.currentImageIndex === -1) return;

    e.preventDefault();

    // Determine zoom direction
    const delta = e.deltaY < 0 ? 1.1 : 0.9;

    // Update zoom level
    this.zoomLevel *= delta;

    // Limit zoom level - allow much more zooming in but keep minimum zoom
    this.zoomLevel = Math.max(0.1, Math.min(20, this.zoomLevel));

    // Apply zoom
    if (this.isComparisonMode) {
      this.updateComparisonView();
    } else {
      this.applyZoomAndPan();
    }
  }

  // Handle mouse down for panning
  handleMouseDown(e) {
    if (this.currentImageIndex === -1) return;

    this.isDragging = true;
    this.dragStartX = e.clientX - this.panX;
    this.dragStartY = e.clientY - this.panY;

    // Change cursor to indicate dragging
    document.body.style.cursor = "grabbing";
  }

  // Handle mouse move for panning
  handleMouseMove(e) {
    if (!this.isDragging) return;

    // Calculate new pan position
    this.panX = e.clientX - this.dragStartX;
    this.panY = e.clientY - this.dragStartY;

    // Apply the pan
    if (this.isComparisonMode) {
      this.updateComparisonView();
    } else {
      this.applyZoomAndPan();
    }
  }

  // Handle mouse up to end panning
  handleMouseUp() {
    this.isDragging = false;

    // Reset cursor
    document.body.style.cursor = "default";
  }

  // Apply zoom and pan to preview canvas
  applyZoomAndPan() {
    if (this.currentImageIndex === -1) return;

    // Apply zoom and pan transform to the preview canvas
    // Use translate3d for better performance with hardware acceleration
    this.previewCanvas.style.transform = `scale(${
      this.zoomLevel
    }) translate3d(${this.panX / this.zoomLevel}px, ${
      this.panY / this.zoomLevel
    }px, 0)`;
  }

  // Toggle comparison mode
  toggleComparisonMode() {
    if (this.currentImageIndex === -1) {
      this.showToast("Error", "No image selected.", "error");
      return;
    }

    this.isComparisonMode = !this.isComparisonMode;

    if (this.isComparisonMode) {
      // Reset zoom and pan when entering comparison mode
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;

      // Hide the preview canvas when in comparison mode
      this.previewCanvas.style.display = "none";
      this.comparisonContainer.classList.add("active");

      // Update the comparison view
      this.updateComparisonView();

      this.addStatusMessage("Comparison mode enabled");
    } else {
      // Show the preview canvas when not in comparison mode
      this.previewCanvas.style.display = "block";
      this.comparisonContainer.classList.remove("active");
      this.applyZoomAndPan();

      this.addStatusMessage("Comparison mode disabled");
    }
  }

  // Update comparison view - side by side view
  updateComparisonView() {
    if (!this.isComparisonMode || this.currentImageIndex === -1) return;

    const image = this.images[this.currentImageIndex];
    const img = image.element;

    // Draw original image on the left canvas
    this.originalCtx.clearRect(
      0,
      0,
      image.original.width,
      image.original.height
    );
    this.originalCtx.putImageData(image.original, 0, 0);

    // Draw processed image on the right canvas
    this.processedCtx.clearRect(
      0,
      0,
      image.original.width,
      image.original.height
    );
    this.processedCtx.drawImage(this.previewCanvas, 0, 0);

    // Get container dimensions
    const containerWidth = this.comparisonContainer.clientWidth;
    const containerHeight = this.comparisonContainer.clientHeight;

    // Calculate the scale needed to fit two images side by side
    // Each image gets half the container width
    const maxWidthPerImage = containerWidth / 2;

    // Calculate scale to fit within the container while maintaining aspect ratio
    const scaleX = maxWidthPerImage / img.width;
    const scaleY = containerHeight / img.height;

    // Use the smaller scale to ensure the image fits completely
    const fitScale = Math.min(scaleX, scaleY);

    // Set initial zoom level when first entering comparison mode
    if (this.zoomLevel === 1) {
      this.zoomLevel = fitScale;
    }

    // Set canvas dimensions based on the image's original aspect ratio
    const scaledWidth = img.width * this.zoomLevel;
    const scaledHeight = img.height * this.zoomLevel;

    // Update canvas display sizes
    this.originalCanvas.style.width = `${scaledWidth}px`;
    this.originalCanvas.style.height = `${scaledHeight}px`;
    this.processedCanvas.style.width = `${scaledWidth}px`;
    this.processedCanvas.style.height = `${scaledHeight}px`;

    // Override CSS constraints that might limit zooming
    this.originalCanvas.style.maxWidth = "none";
    this.originalCanvas.style.maxHeight = "none";
    this.processedCanvas.style.maxWidth = "none";
    this.processedCanvas.style.maxHeight = "none";

    // Ensure the comparison container allows overflow for zooming
    this.comparisonContainer.style.overflow = "hidden";

    // Position the comparison wrapper with flex layout for proper alignment
    this.comparisonWrapper.style.display = "flex";
    this.comparisonWrapper.style.alignItems = "center";
    this.comparisonWrapper.style.justifyContent = "center";
    this.comparisonWrapper.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0)`;

    // Allow the wrapper to grow beyond container bounds
    this.comparisonWrapper.style.minWidth = "100%";
    this.comparisonWrapper.style.minHeight = "100%";
    this.comparisonWrapper.style.maxWidth = "none";
    this.comparisonWrapper.style.maxHeight = "none";

    // Ensure the canvases are side by side with no gap
    this.originalCanvas.style.margin = "0";
    this.processedCanvas.style.margin = "0";

    // Reset individual canvas transforms
    this.originalCanvas.style.transform = "none";
    this.processedCanvas.style.transform = "none";
  }

  // Handle window resize
  handleResize() {
    if (this.currentImageIndex !== -1) {
      this.processImage();

      if (this.isComparisonMode) {
        this.updateComparisonView();
      } else {
        this.applyZoomAndPan();
      }
    }
  }

  // Export the current image
  exportCurrentImage() {
    if (this.currentImageIndex === -1) {
      this.showToast("Error", "No image selected.", "error");
      return;
    }

    const format = this.exportFormat.value;
    const image = this.images[this.currentImageIndex];
    const filename = image.name.split(".")[0];

    if (format === "svg" || format === "both") {
      this.exportSVG(image, filename);
    }

    if (format === "png" || format === "both") {
      this.exportPNG(image, filename);
    }
  }

  // Export all images
  exportAllImages() {
    if (this.images.length === 0) {
      this.showToast("Error", "No images loaded.", "error");
      return;
    }

    const format = this.exportFormat.value;

    this.images.forEach((image, index) => {
      const filename = image.name.split(".")[0];

      // Select the image to ensure it's processed
      this.selectImage(index);

      if (format === "svg" || format === "both") {
        this.exportSVG(image, filename);
      }

      if (format === "png" || format === "both") {
        this.exportPNG(image, filename);
      }
    });

    this.showToast(
      "Success",
      `Exported ${this.images.length} image(s).`,
      "success"
    );
  }

  // Export as SVG
  exportSVG(image, filename) {
    const width = image.original.width;
    const height = image.original.height;
    const method = this.ditheringMethod.value;
    const dotSize = parseFloat(this.dotSizeSlider.value);
    const spacing = parseFloat(this.spacingSlider.value);
    const dotShape = this.dotShape.value;
    const dotChar = this.dotChar.value || "*";
    let bgColor = this.safeHexColor(this.bgColor.value, "#FFFFFF");
    let dotColor = this.safeHexColor(this.dotColor.value, "#000000");

    // When reverse colors is checked, we don't swap colors, we just invert dot placement

    // Create SVG document
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // Add background if enabled
    if (this.exportWithBg.checked) {
      svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${bgColor}" />`;
    }

    // Add dots based on the processed image
    const processedData = image.processed;

    if (method === "manual") {
      // For manual mode, draw dots with spacing
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;

          // Skip if pixel is white (255) in normal mode, or if pixel is not white (255) in reverse mode
          if (
            (!this.reverseColors.checked && processedData.data[i] === 255) ||
            (this.reverseColors.checked && processedData.data[i] !== 255)
          )
            continue;

          // Use original color in color mode
          let fillColor = dotColor;
          if (this.colorMode.checked) {
            const originalIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = image.original.data[originalIndex];
            const g = image.original.data[originalIndex + 1];
            const b = image.original.data[originalIndex + 2];
            fillColor = `rgb(${r}, ${g}, ${b})`;
          }

          // Draw the dot based on the selected shape
          if (dotShape === "circle") {
            svg += `<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${fillColor}" />`;
          } else if (dotShape === "square") {
            svg += `<rect x="${x - dotSize}" y="${y - dotSize}" width="${
              dotSize * 2
            }" height="${dotSize * 2}" fill="${fillColor}" />`;
          } else if (dotShape === "triangle") {
            const side = 2 * dotSize;
            const height = dotSize * Math.sqrt(3);
            const points = `${x},${y - (2 / 3) * height} ${x - side / 2},${
              y + (1 / 3) * height
            } ${x + side / 2},${y + (1 / 3) * height}`;
            svg += `<polygon points="${points}" fill="${fillColor}" />`;
          } else if (dotShape === "character") {
            const fontSize = Math.max(dotSize * 2, 8);
            svg += `<text x="${x}" y="${y}" font-family="Arial" font-size="${fontSize}" fill="${fillColor}" text-anchor="middle" dominant-baseline="middle">${dotChar}</text>`;
          }
        }
      }
    } else {
      // For other dithering methods, draw pixel by pixel
      // For efficiency, we'll use rectangles for runs of black pixels
      for (let y = 0; y < height; y++) {
        let x = 0;
        while (x < width) {
          const i = (y * width + x) * 4;

          // If pixel is black (0) in normal mode, or white (255) in reverse mode
          if (
            (!this.reverseColors.checked && processedData.data[i] === 0) ||
            (this.reverseColors.checked && processedData.data[i] === 255)
          ) {
            const startX = x;
            let runLength = 1;

            // Find run length of black pixels
            while (
              x + runLength < width &&
              processedData.data[(y * width + (x + runLength)) * 4] === 0
            ) {
              runLength++;
            }

            // Use original color in color mode
            let fillColor = dotColor;
            if (this.colorMode.checked) {
              const originalIndex = (y * width + startX) * 4;
              const r = image.original.data[originalIndex];
              const g = image.original.data[originalIndex + 1];
              const b = image.original.data[originalIndex + 2];
              fillColor = `rgb(${r}, ${g}, ${b})`;
            }

            // Add rectangle for the run
            svg += `<rect x="${startX}" y="${y}" width="${runLength}" height="1" fill="${fillColor}" />`;

            x += runLength;
          } else {
            x++;
          }
        }
      }
    }

    // Close SVG document
    svg += "</svg>";

    // Create download link
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_stipple.svg`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);

    this.addStatusMessage(`Exported "${filename}_stipple.svg"`);
    this.showToast("Success", `Exported SVG file.`, "success");
  }

  // Export as PNG
  exportPNG(image, filename) {
    // Create a canvas for the PNG export
    const canvas = document.createElement("canvas");
    canvas.width = image.original.width;
    canvas.height = image.original.height;
    const ctx = canvas.getContext("2d");

    // Draw the preview image to the canvas
    ctx.drawImage(this.previewCanvas, 0, 0);

    // Create download link
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_stipple.png`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);

      this.addStatusMessage(`Exported "${filename}_stipple.png"`);
      this.showToast("Success", `Exported PNG file.`, "success");
    });
  }

  // Reset settings to default values
  resetSettings() {
    this.ditheringMethod.value = "manual";
    this.thresholdSlider.value = 14;
    this.dotSizeSlider.value = 1.4;
    this.spacingSlider.value = 3.2;
    this.contrastSlider.value = 6;
    this.brightnessSlider.value = 0;
    this.dotShape.value = "square";
    this.dotChar.value = "*";
    this.bgColor.value = "#FFFFFF";
    this.bgColorPreview.style.backgroundColor = "#FFFFFF";
    this.bgColorPicker.value = "#FFFFFF";
    this.dotColor.value = "#000000";
    this.dotColorPreview.style.backgroundColor = "#000000";
    this.dotColorPicker.value = "#000000";
    this.exportWithBg.checked = true;
    this.reverseColors.checked = false;
    this.colorMode.checked = false;
    this.exportFormat.value = "both";

    // Update UI
    this.updateSliderValues();
    this.toggleDotCharInput();
    this.toggleManualSettings();

    // Process image with new settings
    this.processImage();

    this.addStatusMessage("Reset settings to default values.");
    this.showToast("Info", "Settings reset to defaults.", "warning");
  }

  // Toggle log modal
  toggleLogModal() {
    // Use Bootstrap's modal API
    const logModal = new bootstrap.Modal(this.logModalOverlay);
    logModal.show();

    // Sync the log content when opening
    this.syncLogContent();
  }

  // Close log modal
  closeLogModal() {
    // Use Bootstrap's modal API
    const logModal = bootstrap.Modal.getInstance(this.logModalOverlay);
    if (logModal) {
      logModal.hide();
    }
  }

  // Toggle export modal
  toggleExportModal() {
    // Use Bootstrap's modal API
    const exportModal = new bootstrap.Modal(this.exportModalOverlay);
    exportModal.show();
  }

  // Close export modal
  closeExportModal() {
    // Use Bootstrap's modal API
    const exportModal = bootstrap.Modal.getInstance(this.exportModalOverlay);
    if (exportModal) {
      exportModal.hide();
    }
  }

  // Sync log content from status area to modal
  syncLogContent() {
    // Clear the modal status area
    this.modalStatusArea.innerHTML = "";

    // Copy all status messages to the modal
    const statusMessages = this.statusArea.querySelectorAll(".status-message");
    statusMessages.forEach((message) => {
      const clone = message.cloneNode(true);
      this.modalStatusArea.appendChild(clone);
    });

    // Scroll to bottom
    this.modalStatusArea.scrollTop = this.modalStatusArea.scrollHeight;
  }

  // Add a status message
  addStatusMessage(message) {
    // Create the message element
    const statusMessage = document.createElement("div");
    statusMessage.className = "status-message";
    statusMessage.textContent = message;

    // Add to the sidebar status area
    this.statusArea.appendChild(statusMessage);
    this.statusArea.scrollTop = this.statusArea.scrollHeight;

    // Add to the modal status area if it exists
    if (this.modalStatusArea) {
      const clone = statusMessage.cloneNode(true);
      this.modalStatusArea.appendChild(clone);
      this.modalStatusArea.scrollTop = this.modalStatusArea.scrollHeight;
    }
  }

  // Show a toast notification
  showToast(title, message, type = "success") {
    const toastContainer = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "✓";
    if (type === "error") icon = "✗";
    if (type === "warning") icon = "⚠";

    toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Hide the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);

    // Close button
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.remove("show");
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    });
  }

  // Utility function to ensure a valid hex color
  safeHexColor(hexColor, defaultColor) {
    const color = hexColor.trim();
    if (color.startsWith("#")) {
      const hex = color.substring(1);
      if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return color.toUpperCase();
      }
    }
    return defaultColor;
  }

  // Utility function to convert hex color to RGB
  hexToRgb(hexColor) {
    const hex = this.safeHexColor(hexColor, "#000000").substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }

  // Utility function to invert a hex color
  invertHexColor(hexColor) {
    const hex = this.safeHexColor(hexColor, "#000000").substring(1);
    const r = 255 - parseInt(hex.substring(0, 2), 16);
    const g = 255 - parseInt(hex.substring(2, 4), 16);
    const b = 255 - parseInt(hex.substring(4, 6), 16);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Check if page is in an iframe
  if (window.self !== window.top) {
    // Page is in an iframe, add class to body
    document.body.classList.add("in-iframe");
  }

  const app = new StippleApp();
});
