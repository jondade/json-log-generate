// Globals
var jsonParts = [];
var provider = splunk;
var method = "UI";
var type = reqHeader;

// Providers
var splunk = { name:'splunk', start:'{ "time": %{now.sec}V, "host":"fastly-%{req.service_id}V", "sourcetype":"_json", "event": { ', end:' } }' };
var sumologic = { name: 'sumologic', start:'{ ',end:' } '};
var jsonPlain = { name: 'jsonPlain', start:'{ ',end:' } '};

// value types
var numberData = {name: 'numberData', start:'', end:''};
var stringData = {name: 'stringData', start: '"', end:'"'};
var reqHeader = {name: 'reqHeader', start: '"%{', end:'}i"'};
var respHeader = {name: 'respHeader', start: '"%{', end: '}o"'};
var vclData = {name: 'vclData', start: '"%{json.escape(', end: ')}V"'};
var timeData = {name: 'timeData', start: '"%{', end: '}t"'};
var cookieData = {name: 'cookieData', start: '"%{', end: '}C"'};
var booleanData = {name: 'booleanData', start: '"%{if((', end: '), true, false)}V'}

var methods = [{name: 'UI'},
               {name: 'API'},
               {name: 'RAW'}];

// Set basics up on page load
function init() {
  updateProvider();
  updateMethod();
  updateType();
}

// Clear out the fields
function reset() {
  jsonParts = [];
  updateGenerated();
}

// spit out the data for use
function updateGenerated(){
  out = '<span class="gen">'+ provider.start + '</span>';
  out = out + buildInnerJson();
  out = out + '<span class="gen">' + provider.end + '</span>';
  document.getElementById("generated").innerHTML = out;
  updateLength();
}

function removePart(id) {
  jsonParts.splice(id, 1);
  updateGenerated();
}

function buildInnerJson() {
  parts = "";
  for (id = 0; id < jsonParts.length; id++) {
    parts += '<span class="part" alt="Click to remove" id="' + id + '" onClick="removePart(' + id + ')">';
    parts += jsonParts[id];
    parts += '</span>';
    if (id < (jsonParts.length - 1) ) {
      parts += '<span class="separator">, </span>';
    }
  }
  return parts;
}

// update displayed length
function updateLength() {
  totalLength = provider.start.length + provider.end.length + jsonParts.join(", ").length;
  var lengthspan = document.getElementById("totallength");
  lengthspan.innerHTML = totalLength;
  if ( totalLength > 4096 ){
    lengthspan.style.color = "#e82c2a";
  } else {
    lengthspan.style.color = "#e3e3e3";
  }
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
      provider = jsonPlain;
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
    case "VCL":
      method = "VCL";
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

function updateType(newType) {
  if (newType === undefined) {
    newType = document.getElementById("type").value;
  }

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
    case "time":
      type = timeData;
      break;
    case "cookie":
      type = cookieData;
      break;
    case "boolean":
      type = booleanData;
      break;
  }
}

function addCommon(type, name, source){
  updateType(type);
  addValue(name, source);
}

// add the new object to the list.
function addValue(key, value) {
  if (key === undefined) {
    key = document.getElementById("name").value
  }
  if (value === undefined) {
    value = document.getElementById("source").value
  }
  // empty string
  var newPart = "";
  // set the json key
  newPart = newPart + '"' + key + '":';
  // set the json value
  newPart = newPart + type.start + value + type.end;

  jsonParts.push(newPart);

  updateGenerated();
}

function toggle(id) {
  var thisID = document.getElementById(id);
  var thisIDdiv = (thisID.getElementsByTagName("div"))[0];
  var thisIDspan = (thisID.getElementsByTagName("span"))[0];

  if (getStyleValue(thisIDdiv, 'display') == "none"){
    thisIDdiv.style.display = "block";
    thisIDspan.innerHTML = "-";
  } else {
    thisIDdiv.style.display = "none";
    thisIDspan.innerHTML = "+";
  }
}

function expand(id, expand) {
  var thisID = document.getElementById(id);
  var thisExpand = document.getElementById(expand);
  if ( getStyleValue(thisID, 'display') == 'none' ) {
    thisID.style.display = "block";
    thisExpand.innerHTML = '-';
  } else {
    thisID.style.display = 'none';
    thisExpand.innerHTML = '+';
  }
}

function showHelp(id) {
  var thing = document.getElementById(id);
  if ( getStyleValue(thing, 'display') == 'none'){
    thing.style.display = 'block';
  } else {
    thing.style.display = 'none';
  }
}

function getStyleValue(element, property) {
  var style = window.getComputedStyle(element);
  return style.getPropertyValue(property);
}
