function changeDevice() {

  const preview = document.getElementById("mobile-preview");

  const device = document.getElementById("device-select").value;

  if (device === "iphone-se") {

    preview.style.width = "320px";
    preview.style.height = "568px";

  }

  else if (device === "iphone-14") {

    preview.style.width = "390px";
    preview.style.height = "844px";

  }

  else if (device === "android-small") {

    preview.style.width = "360px";
    preview.style.height = "640px";

  }

  else if (device === "android-large") {

    preview.style.width = "412px";
    preview.style.height = "915px";

  }

  else if (device === "tablet") {

    preview.style.width = "768px";
    preview.style.height = "1024px";

  }

}