// dynamicaly inject
var s = document.createElement('script');
s.type= 'text/javascript';
s.src = chrome.extension.getURL('inject.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
document.body.appendChild(s);

// open up a long-lived connection to background.js
var port = chrome.runtime.connect({name:"FROM_CONTENT_SCRIPT"});

// use the long-lived connection to deligate message from inject.js to background.js
window.addEventListener('message', function(event) {
  if ( event.source == window ){
	port.postMessage(event.data);
  }
}, false);
