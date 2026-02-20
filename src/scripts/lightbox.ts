class LightboxController {
  private lightbox: HTMLElement;
  private overlay: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private image: HTMLImageElement;
  private caption: HTMLElement;
  private currentIndex = 0;
  private images: Array<{ src: string; alt: string; title: string }> = [];

  constructor(lightbox: HTMLElement) {
    this.lightbox = lightbox;
    this.overlay = this.lightbox.querySelector(".lightbox-overlay") as HTMLElement;
    this.closeBtn = this.lightbox.querySelector(".lightbox-close") as HTMLButtonElement;
    this.prevBtn = this.lightbox.querySelector(".lightbox-prev") as HTMLButtonElement;
    this.nextBtn = this.lightbox.querySelector(".lightbox-next") as HTMLButtonElement;
    this.image = this.lightbox.querySelector(".lightbox-image") as HTMLImageElement;
    this.caption = this.lightbox.querySelector(".lightbox-caption") as HTMLElement;

    this.init();
  }

  private init() {
    this.closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });

    this.overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });

    this.prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.prev();
    });

    this.nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.next();
    });

    const lightboxContent = this.lightbox.querySelector(".lightbox-content");
    if (lightboxContent) {
      lightboxContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (!this.lightbox.classList.contains("active")) return;

      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
    });

    this.lightbox.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "opacity") return;

      if (this.lightbox.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    this.lightbox.addEventListener("keydown", (e) => {
      if (!this.lightbox.classList.contains("active")) return;

      if (e.key === "Tab") {
        const focusableElements = this.lightbox.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  private collectGalleryItems() {
    return Array.from(document.querySelectorAll(".gallery-item"));
  }

  private refreshImages() {
    const galleryItems = this.collectGalleryItems();
    this.images = galleryItems.map((item) => {
      const img = item.querySelector("img");
      const href = item.getAttribute("href");

      return {
        src: href || "",
        alt: img?.getAttribute("alt") || "",
        title: img?.getAttribute("alt") || "",
      };
    });

    return galleryItems;
  }

  openByElement(element: Element) {
    const galleryItems = this.refreshImages();
    const index = galleryItems.indexOf(element);

    if (index < 0 || this.images.length === 0) {
      return;
    }

    this.open(index);
  }

  private open(index: number) {
    this.currentIndex = index;
    this.updateImage();
    this.lightbox.classList.add("active");
    this.lightbox.setAttribute("aria-hidden", "false");
    this.lightbox.removeAttribute("inert");
    this.closeBtn.focus();
  }

  private close() {
    this.lightbox.classList.remove("active");
    this.lightbox.setAttribute("aria-hidden", "true");
    this.lightbox.setAttribute("inert", "");
  }

  private prev() {
    if (this.images.length === 0) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  private next() {
    if (this.images.length === 0) return;

    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  private updateImage() {
    const imageData = this.images[this.currentIndex];
    if (!imageData) {
      return;
    }

    this.image.alt = imageData.alt;
    this.caption.textContent = imageData.title;
    this.image.src = imageData.src;
    this.image.style.opacity = "1";
    this.image.style.display = "block";
  }
}

let lightboxInstance: LightboxController | null = null;

function getOrCreateLightbox(): LightboxController | null {
  if (lightboxInstance) {
    return lightboxInstance;
  }

  const lightboxEl = document.getElementById("lightbox");
  if (!lightboxEl) {
    console.warn("Lightbox initialization skipped - element not found");
    return null;
  }

  lightboxInstance = new LightboxController(lightboxEl);
  return lightboxInstance;
}

export function openLightboxFromElement(element: Element) {
  const lightbox = getOrCreateLightbox();
  if (!lightbox) {
    return;
  }

  lightbox.openByElement(element);
}
