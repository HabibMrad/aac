/*
  -- app.js
  Main JS file
  Angular modules and controllers is located here

*/

var runApp = null;
const ORIENTATION_TOP = 0;
const ORIENTATION_BOTTOM = 180;
const ORIENTATION_LEFT = 90;
const ORIENTATION_RIGHT = -90;

var aacApp = angular.module("otsPescGeneral", ["ngTouch"]);

aacApp.factory('$global', function(){
        return {
          currentPhrase: [],
          isHome: 1,
          currentTab: "",
          currentPage: "",
          currentDerivable: "",
          gridSize: [0,0],
          gridSizeStatic: [0,0],
          gridQuantity: 0,
          PageNo: 0,
          MaxPageNo: 0
        };
    });

aacApp.controller('otsControlGeneral', function ($scope, $http, $timeout, $global) {

    $scope.global = $global;

    var setSettings = function () {
        $global.pageText1 = otsimo.kv.pageText1;
        $global.pageText2 = otsimo.kv.pageText2;
        $global.pageText3 = otsimo.kv.pageText3;
        $global.pageText4 = otsimo.kv.pageText4;
        $scope.timeIntervalText1 = otsimo.kv.timeIntervalText1;
        $scope.timeIntervalText2 = otsimo.kv.timeIntervalText2;
        $scope.timeIntervalText3 = otsimo.kv.timeIntervalText3;
        $scope.timeIntervalText4 = otsimo.kv.timeIntervalText4;
        $scope.previousText = otsimo.kv.previousText;
        $scope.nextText = otsimo.kv.nextText;
        $scope.backText = otsimo.kv.backText;
        $scope.completeChnges = otsimo.kv.completeChangesText;
        // Colors & styles
        $scope.headerColor = otsimo.kv.headerColor;
        $scope.generalFont = otsimo.kv.generalFont;
        document.getElementsByClassName("header")[0].style.background = $scope.headerColor;
        document.body.style.fontSize = $scope.generalFont;
        otsimo.tts.setVoice(otsimo.kv.voiceId);

    }

    runApp = function logic(x, y) {
        setSettings();
        $global.changeGridSize(x, y);
        $global.changeCurrentTab("main");
        $global.checkOrientation();
    }

});
