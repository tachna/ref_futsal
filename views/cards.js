var now_utc = Date.now()
var timeOff = new Date().getTimezoneOffset()*60000;
var today = new Date(now_utc-timeOff).toISOString().substring(0, 16);
document.getElementById("DateLocal").setAttribute("max", today);