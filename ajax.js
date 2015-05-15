var msg = {
  "dummy" : "data"
};
var url = "localhost/ajax.php";

var data = getRequestBody(msg);

var getRequestBody = function(msg) {
  var pieces = [];

  for (var key in msg) {
    key = encodeURIComponent(element.name);
    var value = encodeURIComponent(element.value);
    pieces.push(key + "=" + value);
  }

  return pieces.join("&");
};

var xhr = new XMLHttpRequest();
xhr.open("POST", url);
xhr.send(data);

