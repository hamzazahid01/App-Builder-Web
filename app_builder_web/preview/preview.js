function renderPreview() {

  const preview = document.getElementById("mobile-preview");

  preview.innerHTML = "";

  appData.forEach(component => {

    if (component.type === "button") {
      preview.appendChild(renderButton(component));
    }

    if (component.type === "div") {
      preview.appendChild(renderDiv(component));
    }

  });

}

function clearSelectedComponent() {
  selectedComponent = null;
  showDefaultProperties();
}



function changeDevice() {

  const preview =
    document.getElementById("mobile-preview");

  const device =
    document.getElementById("device-select").value;



  // iPhone SE
  if(device === "iphone-se") {

    preview.style.width = "320px";
    preview.style.height = "568px";

  }



  // iPhone 14
  else if(device === "iphone-14") {

    preview.style.width = "390px";
    preview.style.height = "844px";

  }



  // Android Small
  else if(device === "android-small") {

    preview.style.width = "360px";
    preview.style.height = "640px";

  }



  // Android Large
  else if(device === "android-large") {

    preview.style.width = "412px";
    preview.style.height = "915px";

  }

}



changeDevice();