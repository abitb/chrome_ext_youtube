// dynamically inject
var s = document.createElement("script");
s.type = "text/javascript";
s.src = chrome.extension.getURL("inject.js");
s.onload = function() {
  this.parentNode.removeChild(this);
};
document.body.appendChild(s);

// tell inject script about timer (fetched from chrome.storage)
// when first start up and when new value is provided
function tellInjectAboutTimer(timerValue) {
  window.postMessage({
    "from" : "FROM_CONTENT_SCRIPT",
    "timer" : timerValue
  }, "*");
}
chrome.storage.sync.get("timer", function(items) {
  tellInjectAboutTimer(items.timer);
});
chrome.storage.onChanged.addListener(function(changes, namespace) {
  tellInjectAboutTimer(changes["timer"].newValue);
});

// open up a long-lived connection to background.js
var port = chrome.runtime.connect({
  name : "FROM_CONTENT_SCRIPT"
});

// use the long-lived connection to delegate message from inject.js to background.js
window.addEventListener("message", function(event) {
  if (event.source == window) {
    port.postMessage(event.data);
  }
}, false);
