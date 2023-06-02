//Misc Utilities

// Add devices to the device selection box & set default device
function addDevicesToDropDown(element, devices, defaultVal = 'Select...') {
    // Track the count of devices, for labelling only
    let deviceCount = 0;

    console.log("addDevicesToDropDown", element, devices);

    // Get an array of elements from the passed parent class name
    let selector = document.getElementById(element);
    selector.innerHTML = "";

      // Iterate through the devices
      for (let device of devices) {       
        
        deviceCount++;      // Iterate the count of devices

        // Get the device ID
        let deviceId = device.deviceId;
        // Create the label for the device
        let deviceLabel = device.label
          ? device.label
          : `Device ${deviceCount} (${deviceId})`;
  
        // Create an option for the select dropdown with the device label and device ID
        let deviceOption = new Option(deviceLabel, deviceId);
        // Append the option to the select dropdown
        selector.append(deviceOption);
        //console.log("Devices:", deviceOption);
      }
  
      // Set the select dropdown to the default value
      //selector.value = defaultVal;
      console.log ("Media Selector:", selector.id, localStorage.getItem(selector.id));
      selector.selectedIndex = localStorage.getItem(selector.id) || 0; 

      if (selector.id==="videoDevices") {videoDeviceId = devices[selector.selectedIndex].deviceId;}
      if (selector.id==="audioDevices") {audioDeviceId = devices[selector.selectedIndex].deviceId;}

      console.log("videoDeviceId:", videoDeviceId);
      console.log("audioDeviceId:", audioDeviceId);
  }

  //Save Media device selection as a Index noting Android Webview does not support labels or fixed deviceID's
function saveMediaSettings () {
  
  console.log("Saving media device preference (by selection id)...");

  localStorage.setItem("videoDevices", videoDevices.selectedIndex);
  localStorage.setItem("audioDevices", audioDevices.selectedIndex);

  console.log ("Get Video device: ", localStorage.getItem("videoDevices"));
  console.log ("Get Audio device: ", localStorage.getItem("audioDevices"));

  preflight();

}


function log(msg) {
  logElement.innerHTML += `${msg}\n`;
}


function wait(delayInMS) {
  return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

  
function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.start();
  log(`${recorder.state} for ${lengthInMS / 1000} seconds…`);

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event) => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(() => {
    if (recorder.state === "recording") {
      recorder.stop();
    }
  });

  return Promise.all([stopped, recorded]).then(() => data);
}

function stop(stream) {
  stream.getTracks().forEach((track) => track.stop());
}



  
