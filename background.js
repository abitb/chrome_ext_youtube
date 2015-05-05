chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "FROM_CONTENT_SCRIPT");
  port.onMessage.addListener(function(msg) {
    var data = getRequestBody(msg);
    postDataToServer(data);
  });
});

var url = "http://localhost/ajax.php";

var getRequestBody = function(msg) {
  var pieces = [];

  for (var key in msg) {
    key = encodeURIComponent(key);
    var value = encodeURIComponent(msg[key]);
    pieces.push(key + "=" + value);
  }

  return pieces.join("&");
};

// function callback(data) {
  // alert(data);
// }

function postDataToServer(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//   
  // xhr.onreadystatechange = function() {
    // if (this.readyState === 4) {
      // var status = this.status;
//   
      // if ((status >= 200 && status < 300) || status === 304) {
        // callback(this.responseText);
      // } else {
        // alert("An error occurred");
      // }
    // }
  // };
  
  xhr.send(data);
  xhr = null;
}
