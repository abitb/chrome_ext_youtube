chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "FROM_CONTENT_SCRIPT");
  port.onMessage.addListener(function(msg) {
    // create new xhr object each time to send message
    // by appending query string in ajax POST
    postDataToServer(getRequestBody(msg));
  });
});

// the server domain name should be the same as manifest-> permissions
var url = "http://128.255.44.227/ajax.php";
chrome.storage.sync.set({
  'timer' : 200
});

// build query string that gets appended to post request
function getRequestBody(msg) {
  var pieces = [];
  for (var key in msg) {
    key = encodeURIComponent(key);
    var value = encodeURIComponent(msg[key]);
    pieces.push(key + "=" + value);
  }
  return pieces.join("&");
};

function postDataToServer(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send(data);
  xhr = null;
}
