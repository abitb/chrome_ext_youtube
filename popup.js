var btnGet, btnSet, inputUrl, inputTimer, bg;

function getUrl() {
  inputUrl.value = bg.url;
}
function setUrl() {
  bg.url = inputUrl.value;
}

// all listeners are added there
document.addEventListener('DOMContentLoaded', function() {
  btnGet = document.getElementById("btnGet");
  btnSet = document.getElementById("btnSet");
  inputUrl = document.getElementById("url");
  inputTimer = document.getElementById("timer");
  
  bg = chrome.extension.getBackgroundPage();

  btnGet.addEventListener('click', function() {
    getUrl();
  });

  btnSet.addEventListener('click', function() {
    setUrl();
  });

  getUrl();
});

