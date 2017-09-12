var jsonParts = [];
var provider = "splunk";
var method = "UI";

var splunkStart = '{ "time": %{time.now.sec}V, "host":"fastly-%{req.service_id}V", "sourcetype":"_json", "event" { ';
var splunkEnd = ' } }';

var start = "";
var end = "";

function init() {
  var jsonParts = [];
  var provider = "splunk";
  var method = "UI";
}

function debugAlert() {
  alert("provider is: " + provider + 
    "\njsonString is: " + jsonString +
    "\nmethod is: " + method);
}

function updateGenerated(){
  out = "";
  switch (provider) {
    case "splunk":
      out = out + splunkStart;
      break;
    case "sumologic":
      out = out + sumologicStart;
      break;
    case "bigquery":
      out = out + bigqueryStart;
      break
  }

  out = out + jsonParts.join(", ");

  out = out + splunkEnd;

  document.getElementById("generated").innerHTML = out;
}

function updateProvider(){
  // stash the new value
  var prov = document.getElementById("provider").value;
  // compare value against list
  switch (prov) {
    case "splunk":
      provider = "splunk";
      start = splunkStart;
      end = splunkEnd;
      break;
    case "sumologic":
      provider = "sumologic";
      break;
    case "bigquery":
      provider = "bigquery";
      break;
    case "other":
      provider = "other";
      break;
    case "bad":
      alert("Bad choice. Try again.");

  } 

  // Debug out
  debugAlert();

  updateGenerated();
}


function updateMethod(){
  // stash the new value
  var val = document.getElementById("method").value;
  // compare value against list
  switch (val) {
    case "UI":
      method = "UI";
      break;
    case "API":
      method = "API";
      break;
    case "bad":
      alert("Blank chosen. Please try again.");
    default:
      method = "UI";
      alert("Falling back to UI formatting");
  } 

  // Debug out
  debugAlert();

  updateGenerated();
}

function addValue() {
  var newPart = "";
  newPart = newPart + '"' + document.getElementById("name").value + '":';
  newPart = newPart + '"' + document.getElementById("source").value + '"';

  jsonParts.push(newPart);

  updateGenerated();
}
