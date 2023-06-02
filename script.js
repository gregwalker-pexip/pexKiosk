let pexRTC = new PexRTC();

const currentWebPath = window.location.href;

//Some Global Variables
let bandwidth; // Can be controlled further with pexRTC variables based on RX/TX
let call_type; // Set to "none" via a api only call
let pinStatus = ""; // You will need to build PIN dialogs if using user based PINs
let pin = "";
let maxCallDuration = "86400"; // Not implemented!!!!!!!

let transferLocation = "pextv";  // From Mobile Remote

// Configure Default Settings
let server = "pex-server.com";
let conference = "pexkiosk";
let callAlias =
  "pexK-" + Math.random().toString(36).substring(2, 10).toUpperCase(); //Randomise the alias name for uniqueness
let callRate = "2464"; // Maximum call rate (Kbps)
let callTypeSelection = "none";
let callTag = "Pexip Kiosk Demo";

let pexUUID;
let qrCode;
let qrGenerator;

let remoteQR = document.getElementById("remoteQR");

console.log("-- Pexip Kiosk Sample Demo Settings --");
console.log("server:", server);
console.log("alias:", callAlias);
console.log("conference:", conference);
console.log("callRate:", callRate);

//  CSS Grid Generator - https://cssgrid-generator.netlify.app/
//  CSS Text Rotator - https://daily-dev-tips.com/posts/css-only-word-rotator/
//  Favicon Generator - https://favicon.io/favicon-generator/
//  PWA  -  https://web.dev/learn/pwa/app-design/
//  PWA Generator - https://www.pwabuilder.com/


//  To Do:
//  1. Recover from when host enters sleep\powersave
//  2. Local QR code generation (i.e. qr.js)

//  Important! You must have a valid SSL cert for device selection to work!!
//  Set the constraints of the video to search for
//  https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const constraints = {
  video: {
    mandatory: {
      maxWidth: 3840,
      maxHeight: 2160,
    },
    optional: [
      {
        minWidth: 1920,
      },
      {
        minHeight: 1080,
      },
    ],
  },
  audio: true,
};

//Reference usable html elements
let connectButton = document.getElementById("connectButton");
let disconnectButton = document.getElementById("endCallButton");

let aliasName = document.getElementById("aliasName");
aliasName.innerHTML = callAlias;

let audioDevices = document.getElementById("audioDevices");

let videoDevices = document.getElementById("videoDevices");

let homeBlock = document.getElementById("homeBlock");
let nameBlock = document.getElementById("nameBlock");
let clockBlock = document.getElementById("clockBlock");
let infoBlock = document.getElementById("infoBlock");
let infoTitle = document.getElementById("infoTitle");
let muteIcon = document.getElementById("muteIcon");

let ldsHourglass = document.getElementById("lds-hourglass");

let audioDeviceId;
let videoDeviceId;

aliasName.value = callAlias;
bandwidth = callRate;

let mediaStats = document.getElementById("mediaStatsButton");

let infoPanel0 = document.getElementById("infoPanel0");
infoPanel0.innerHTML = callRate + " (kbps)";

let infoPanel1 = document.getElementById("infoPanel1");
let infoPanel2 = document.getElementById("infoPanel2");
let infoPanel3 = document.getElementById("infoPanel3");
let infoPanel4 = document.getElementById("infoPanel4");

// The far-end video element.  If your webcam has a mic it will use this as well
var farEndVideo = document.getElementById("farEndVideo");

// The self-view video element
var selfViewVideo = document.getElementById("selfViewVideo");

//Some Event Listners for button clicks etc.
connectButton.addEventListener("click", connect);
disconnectButton.addEventListener("click", disconnect);

// Runs Pexip listners when the page loads
window.addEventListener("load", function (e) {
  // Link the callSetup method to the onSetup callback
  pexRTC.onSetup = callSetup;
  // Link the callConnected method to the onConnect callback
  pexRTC.onConnect = callConnected;
  // Link the callDisconnected method to the onError callback
  pexRTC.onError = callDisconnected;
  // Link the callDisconnected method to the onDisconnect callback
  pexRTC.onDisconnect = callDisconnected;
  // Link the callDisconnected method to the onError callback
  pexRTC.onError = callError;
  // Link the Roster List callback
  pexRTC.onRosterList = rosterList;
  // Link the Conference Update callback
  pexRTC.onConferenceUpdate = conferenceUpdate;
  // Link the Conference Layout Update callback
  pexRTC.onLayoutUpdate = layoutUpdate;
  // Link the Participant Transfer callback
  pexRTC.onCallTransfer = participantTransfer;
  // Link the Participant Update callback
  pexRTC.onParticipantUpdate = participantUpdate;
});

//Disconnect the call if the browser tab is closed
window.addEventListener("beforeunload", function (e) {
  pexRTC.disconnect();
});

//Some functions

function preflight() {
  // Run the async function
  getMediaDevices(constraints);
  pexRTC.video_source = videoDeviceId;
  pexRTC.audio_source = audioDeviceId;
  // Renegotiate the media only
  pexRTC.renegotiate(false);
}

function connect() {
  console.log("Connecting->");

  call_type = callTypeSelection;
  
  getMediaDevices(constraints);
  pexRTC.video_source = videoDeviceId;
  pexRTC.audio_source = audioDeviceId;

  console.log("Making api call without Audio/Video:", videoDeviceId, audioDeviceId);
  //customise pexRTC call variables
  pexRTC.vp8_enabled = false;
  pexRTC.vp9_enabled = false;
  pexRTC.call_tag = callTag;

  //Make the call
  pexRTC.makeCall(server, conference, callAlias, bandwidth, call_type);
}

function disconnect() {
  console.log("Disconnecting->");
  pexRTC.disconnect();
}

function lockConference() {
  console.log("Locked Conference->");
  pexRTC.setConferenceLock(true);
}

function unlockConference() {
  console.log("Unlock Conference->");
  pexRTC.setConferenceLock(false);
}

function endConference() {
  console.log("End Conference->");
  pexRTC.disconnectAll();
}

function getMediaStats() {
  console.log("Get Media Statistics->");
  var obj = pexRTC.getMediaStatistics();
  infoPanel4.innerText = JSON.stringify(obj);
}

// This pexRTC method is called when the call is setting up
function callSetup(stream, pinStatus) {
  console.log("PIN status:", pinStatus);
  // If no pin is required, connect to the call with no pin
  if (pinStatus === "none") {
    // Connect to the call without a pin
    pexRTC.connect();
  } else {
    // The pin is optional
    if (pinStatus === "optional") {
      // Set the title of the pin entry to reflect its requirement
      console.log("PIN is optional:", "using PIN");
      pexRTC.connect(pin);
    } else {
      // Set the title of the pin entry to reflect its requirement
      console.log("PIN is required:", "using PIN");
      pexRTC.connect(pin);
    }
    // Show the pin popup
  }

  if (stream) {
    // Set the selfview video window's source to the stream
    selfViewVideo.srcObject = stream;
  }
}

// This method hangs up the call
function disconnect() {
  console.log("Ending the call...");
  pexRTC.disconnect();
  location.reload();
 
}

// When the call is connected
function callConnected(stream) {
  infoPanel4.innerText =
    "Pexip Infinity Version: " + JSON.stringify(pexRTC.version);

  pexUUID = pexRTC.uuid;
  console.log("My Alias, UUID:", callAlias, pexUUID);

  qrCode = currentWebPath + "remote/?u=" + pexUUID + "-a=" + callAlias;
  qrGenerator =
    "https://api.qrserver.com/v1/create-qr-code/?data=" +
    qrCode +
    "&;size=1000x1000/download.png";
  console.log("📇 QR Code:", qrCode);
  console.log("📇 QR Generator URL:", qrGenerator);
  remoteQR.src = qrGenerator; //PexRTC Participant UUID

  // Check that the stream is defined and is a Media Stream
  if (typeof MediaStream !== "undefined" && stream instanceof MediaStream) {
    // Set the far end video window's source to the stream
    farEndVideo.srcObject = stream;
    ldsHourglass.style.display = "none";
  } else {
    // Set the far end video window's source to the stream
    farEndVideo.src = stream;
    ldsHourglass.style.display = "none";
  }

  // Clear the pin, else may be cached for the next call
  pexRTC.pin = null;
}

function callDisconnected(reason) {
  console.log("callDisconnected:", reason);
  location.reload();
}

function callError(reason) {
  console.log("callError:", reason);
}

let addVideo = false;


function transferSelf() {
  call_type = "";
 
  // Run the async function
  getMediaDevices(constraints);
  pexRTC.video_source = videoDeviceId;
  pexRTC.audio_source = audioDeviceId;

  console.log("Making call with Audio/Video:", videoDeviceId, audioDeviceId);
  //customise pexRTC call variables
  pexRTC.vp8_enabled = false;
  pexRTC.vp9_enabled = false;
  pexRTC.call_tag = callTag;

  //Make the call
  pexRTC.makeCall(server, transferLocation, callAlias, bandwidth, call_type);
  homeBlock.style.display = "none";
  nameBlock.style.display = "none";
  clockBlock.style.display = "none";
  infoTitle.style.display = "none";
  ldsHourglass.style.display = "block";
}

function participantTransfer(transfer) {
  //Participant Transferred
  homeBlock.style.display = "none";
  nameBlock.style.display = "none";
  clockBlock.style.display = "none";
  infoTitle.style.display = "none";
  ldsHourglass.style.display = "block";

  console.log("Participant Transfer:", transfer, pexUUID);
  pexRTC.addCall("");
  addVideo = true;
  pexUUID = pexRTC.uuid;

  // pexRTC.renegotiate(true);
}

function rosterList(roster) {
  infoPanel1.innerText = "Participant Info: " + JSON.stringify(roster);
}

function participantUpdate(participant) {
  if (participant.uuid === pexUUID) {
    if (participant.is_muted === "YES") {
      muteIcon.style.display = "block";
    } else {
      muteIcon.style.display = "none";
    }
  }
}

function layoutUpdate(layout) {
  console.log("Layout Update:", layout);
  infoPanel3.innerText = "Layout Info: " + JSON.stringify(layout);
}

function conferenceUpdate(properties) {
  console.log("Conference Update:", properties);
  let layout = JSON.stringify(properties);
  infoPanel2.innerText = "Conference Info: " + layout;
}

function saveSettings() {
  localStorage.setItem("conference", conferenceName.value);
  localStorage.setItem("alias", aliasName.value);
  localStorage.setItem("bandwidth", callRateName.value);
  location.reload();
}

function clearSettings() {
  localStorage.clear();
  location.reload();
}

// An async function to get the video and audio devices
async function getMediaDevices(constraints) {
  // Request permission to list devices
  mediaDevices = await navigator.mediaDevices.getUserMedia(constraints);
  // Enumerate the devices
  let devices = await navigator.mediaDevices.enumerateDevices();

  // Filter only video devices
  let video_devices = devices.filter((d) => d.kind === "videoinput");
  // Filter only audio devices
  let audio_devices = devices.filter((d) => d.kind === "audioinput");

  //Turn the media devices off after getting the list (turns the camera indicator light off)
  mediaDevices.getTracks().forEach(function (track) {
    track.stop();
  });

  console.log("Video Devices list:", video_devices);
  console.log("Audio Devices list:", audio_devices);

  // Set the Video Devices so we can show on the UI
  addDevicesToDropDown(
    "videoDevices",
    video_devices,
    localStorage.getItem("videoDeviceId")
  );

  // Set the Audio Devices so we can show on the UI
  addDevicesToDropDown(
    "audioDevices",
    audio_devices,
    localStorage.getItem("audioDeviceId")
  );
}

window.addEventListener("beforeunload", function (e) {
  pexRTC.disconnect();
});

var deviceName = document.getElementById("deviceName");
var descriptionName = document.getElementById("descriptionName");
deviceName.innerHTML = "Video Kiosk Demo";
descriptionName.innerHTML = "Sample web app powered by Pexip";

window.addEventListener("load", function () {
  function getDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const d = new Date();

    document.getElementById("date").innerHTML = `${days[d.getDay()]}, ${
      months[d.getMonth()]
    } ${d.getDate()}`;
  }

  function getTime() {
    document.getElementById("time").innerHTML = new Date()
      .toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .toUpperCase();
    getDate();
    setTimeout(getTime, 1000);
  }

  getTime();
});

preflight();
console.log("-- Preflight (OK) --");

connect();
console.log("-- Connect (OK) --");
