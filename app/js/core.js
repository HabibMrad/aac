/*
  -- core.js
  This file contains generic functions for other javascript files to use.
  Like returnTime(), capitalize() etc.

*/
/*
document.ontouchmove = function(event){
    event.preventDefault();
}*/

if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

function returnTime() {
    var d = new Date();
    return d.getTime();
}

function clickCover(){
  document.getElementById("derivableCover").style.display = "none";
}

function updateCurrentPhraseScroll() {
    setTimeout(function () {
        var element = document.getElementById("cPhrase");
        element.scrollLeft = element.scrollWidth - 924;
    }, 1);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function deviceType(){
  var type;
  if(window.innerWidth + window.innerHeight < 1500){
    type = "phone";
  }else{
    type = "tablet";
  }
  return type;
}
Array.prototype.contains = function(obj) {
    return this.indexOf(obj) > -1;
};

String.prototype.contains = function(it) {
    return this.indexOf(it) != -1;
};

function sortByLength(a, b) {
  if (a.length > b.length) {
    return 1;
  }
  if (a.length < b.length) {
    return -1;
  }
  return 0;
}

/*
var statusSettings = 0;

function toggleSettings(){
  if(statusSettings != 1){
    document.getElementById("settings").style.right = "0px";
    statusSettings = 1;
  }else{
    document.getElementById("settings").style.right = "-270px";
    statusSettings = 0;
  }
}*/
