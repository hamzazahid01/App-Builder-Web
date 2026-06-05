window.ImageComponent = {
  type: "image",
  label: "Image",
  getDefaultLayout() {
    return { width: 280, height: 150 };
  },
  create() {
    return {
      ...ComponentFactory.createBase("image"),
      styles: {
        sourceType: "url",
        displayType: "normal",
        fit: "cover",
        borderEnabled: false,
        borderWidth: 0,
        borderColor: "#000000",
        borderStyle: "solid",
        borderRadius: 10,
        borderRadiusCorners: { tl: 10, tr: 10, bl: 10, br: 10 },
        opacity: 1,
        background: {
          enabled: false,
          type: "solid",
          color: "#ffffff",
          gradientAngle: 90,
          gradientStart: "#ffffff",
          gradientEnd: "#f8fafc"
        },
        shadow: {
          enabled: false,
          color: "#000000",
          opacity: 0.25,
          blur: 8,
          spread: 0,
          offsetX: 0,
          offsetY: 4,
          insetEnabled: false,
          multiShadows: [],
          glowEnabled: false,
          glowColor: "#ffffff",
          glowBlur: 0,
          glowSpread: 0,
          presetType: "none",
          intensity: "medium"
        },
        widthMode: "fixed",
        heightMode: "fixed",
        aspectRatioLocked: true,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        align: "center",
        padding: boxSpacing(0, 0, 0, 0),
        margin: boxSpacing(0, 0, 0, 0),
        crop: {
          enabled: false,
          mode: "free",
          aspectRatio: null,
          zoom: 1,
          x: 0,
          y: 0,
          rotation: 0
        },
        filters: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          grayscale: 0,
          sepia: 0,
          hueRotate: 0
        },
        overlay: {
          enabled: false,
          type: "color",
          color: "#000000",
          gradientAngle: 90,
          gradientStart: "#000000",
          gradientEnd: "#ffffff",
          opacity: 0.2
        },
        interaction: {
          clickable: false,
          href: "",
          popup: false,
          hoverEffect: "none",
          zoomOnHover: false,
          clickAnimation: "none"
        },
        animation: {
          enabled: false,
          type: "none",
          duration: 1000,
          delay: 0,
          loop: false,
          speed: 1
        },
        responsive: {
          enabled: false,
          mobileScale: 0.9,
          tabletScale: 0.95
        },
        lazyLoad: false,
        altText: "Image",
        placeholderSrc: "https://placehold.co/600x300",
        visibleOn: {
          desktop: true,
          tablet: true,
          mobile: true
        }
      },
      props: {
        src: "https://placehold.co/600x300",
        alt: "Image",
        source: "url",
        srcUrl: "https://placehold.co/600x300"
      }
    };
  }
};
window.ComponentRegistry.image = window.ImageComponent;
