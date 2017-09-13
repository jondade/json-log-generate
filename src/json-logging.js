// Globals
var jsonParts = [];
var provider = splunk;
var method = "UI";
var type = stringData;

// Providers
var splunk = { name:'splunk', start:'{ "time": %{time.now.sec}V, "host":"fastly-%{req.service_id}V", "sourcetype":"_json", "event" { ', end:' } }' };
var sumologic = { name: 'sumologic', start:'{ ',end:' } '};

// value types
var numberData = {name: 'numberData', start:'', end:''};
var stringData = {name: 'stringData', start: '"', end:'"'};
var reqHeader = {name: 'reqHeader', start: '%{', end:'}i'};
var respHeader = {name: 'respHeader', start: '%{', end: '}o'};
var vclData = {name: 'vclData', start: '%{', end: '}V'};

// Set basics up on page load
function init() {
  jsonParts = [];
  provider = splunk;
  type = stringData;
  method = "UI";
}

// spit out the data for use
function updateGenerated(){
  out = "";

  out = out + provider.start;
  out = out + jsonParts.join(", ");

  out = out + provider.end;

  document.getElementById("generated").innerHTML = out;
}

// Set the logging type
function updateProvider(){
  // stash the new value
  var prov = document.getElementById("provider").value;
  // compare value against list
  switch (prov) {
    case "splunk":
      provider = splunk;
      break;
    case "sumologic":
      provider = sumologic;
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

// set the delivery method
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
    default:
      method = "UI";
      alert("Falling back to UI formatting");
  } 

  updateGenerated();
}

function updateType() {
  var newType = document.getElementById("type").value;
  switch(newType) {
    case "reqheader":
      type = reqHeader;
      break;
    case "respheader":
      type = respHeader;
      break;
    case "number":
      type = numberData;
      break;
    case "vclvalue":
      type = vclData;
      break;
    case "string":
      type = stringData;
      break;
  }
}

// add the new object to the list.
function addValue() {
  // alert("type is: \n" + type);
  // empty string
  var newPart = "";
  // set the json key
  newPart = newPart + '"' + document.getElementById("name").value + '":';
  // set the json value
  newPart = newPart + type.start + document.getElementById("source").value + type.end;

  jsonParts.push(newPart);

  updateGenerated();
}
