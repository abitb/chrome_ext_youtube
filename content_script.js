var s = document.createElement('script');
s.src = chrome.extension.getURL('inject.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);

//open up a long-lived connection to background.js
var port = chrome.runtime.connect({name:"FROM_CONTENT_SCRIPT"});

//use the long-lived connection to deligate message from inject.js to background.js
window.addEventListener('message', function(event) {
  if (event.data.from == "FROM_INJECTED_PAGE_0" || event.data.from == "FROM_INJECTED_PAGE"){
	// console.log(event.data);    // Message from page script
	// console.log(event.origin);	// https://www.youtube.com
	port.postMessage(event.data);
	// if (event.data.from == "FROM_INJECTED_PAGE_0") {alert("passing to background");};
  }
}, false);
