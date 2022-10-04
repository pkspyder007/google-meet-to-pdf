console.log("POPUP SCRIPT");

function setScreenshotUrl(urls) {
    urls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      document.getElementById("target").appendChild(img);
    });
  }

document.addEventListener("DOMContentLoaded", () => {
  const start = document.getElementById("start");
  const stop = document.getElementById("stop");

  start.addEventListener("click", () => {
    // start.disabled = true
    // stop.disabled = false
    sendMessage({ action: "start_screenshots"});
});

stop.addEventListener("click", () => {
    // start.disabled = false
    // stop.disabled = true
    sendMessage({ action: "stop_screenshots"});
  });
});

function sendMessage(message) {
  chrome.runtime.sendMessage(message, function (response) {
    console.log(response);
  });
}
