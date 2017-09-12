var jsonParts = [];
var provider = "splunk";
var method = "UI";

var splunkStart = '{ "time": %{time.now.sec}V, "host":"fastly-%{req.service_id}V", "sourcetype":"_json", "event" { ';
var splunkEnd = ' } }';

var sumologicStart = '{ ';
var sumologicEnd = ' }';

var start = "";
var end = "";

function init() {
  var jsonParts = [];
  var provider = "splunk";
  start = splunkStart;
  end = splunkEnd;
  var method = "UI";
}

function updateGenerated(){
  out = "";

  out = out + start;
  out = out + jsonParts.join(", ");

  out = out + end;

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
      start = sumologicStart;
      end = sumologicEnd;
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

  updateGenerated();
}

function addValue() {
  var newPart = "";
  newPart = newPart + '"' + document.getElementById("name").value + '":';
  // Find the type
  // type = document.getElementById()
  newPart = newPart + '"' + document.getElementById("source").value + '"';

  jsonParts.push(newPart);

  updateGenerated();
}
