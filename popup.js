var btnGet, btnSet, inputUrl, inputTimer, bg;

function getUrl() {
  inputUrl.value = bg.url;
}

function setUrl() {
  bg.url = inputUrl.value;
}

function getTimer() {
  chrome.storage.sync.get("timer", function(items) {
    inputTimer.value = items.timer;
  });
}

function setTimer() {
  var regex = /^\d+$/;
  if (regex.test(inputTimer.value)){
    chrome.storage.sync.set({
      "timer" : parseInt(inputTimer.value, 10)
    });
  }
}

// all listeners are added there
document.addEventListener("DOMContentLoaded", function() {
  btnGet = document.getElementById("btnGet");
  btnSet = document.getElementById("btnSet");
  inputUrl = document.getElementById("url");
  inputTimer = document.getElementById("timer");

  bg = chrome.extension.getBackgroundPage();

  btnGet.addEventListener("click", function() {
    getUrl();
    getTimer();
  });

  btnSet.addEventListener("click", function() {
    setUrl();
    setTimer();
  });
  
  getUrl();
  getTimer();
});
