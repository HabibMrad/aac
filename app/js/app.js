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

aacApp.factory('$global',function(){
        return {
          currentPhrase: [],
          isHome: 1,
          currentTab: "",
          currentPage: "",
          currentDerivable: "",
          gridSize: [0,0],
          gridSizeStatic: [0,0],
          gridQuantity: 0,
          mainPageNo: 0,
          groupPageNo: 0,
          groupMaxPageNo: 0,
          mainMaxPageNo: 0
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
        $global.changeInterval(1);
        $global.changeCurrentTab("main");
        $global.checkOrientation();
    }

});

aacApp.controller('otsControlHeader', function ($scope, $global) {

    $scope.openRecent = function () {
        $global.changeCurrentTab("recent");
        $global.changeInterval(1);
    }

    $scope.goHome = function () {
        $global.changeCurrentTab("main");
        $global.currentGroup = "";
        $global.currentDerivable = "";
        $global.mainPageNo = 0;
        $global.updateGridQuantity();
    }

    $scope.quitGame = function () {
        if ($global.isHome == 1) {
            otsimo.quitgame();
        } else {
            $scope.goHome();
        }
    }

    $scope.openGrid = function () {
        $global.changeCurrentTab("main");
    }


    $global.changeCurrentTab = function (tabExp) {

        if (tabExp == "main") {
            $global.currentPage = $global.pageText1;
            $global.isHome = 1;
        } else if (tabExp == "group") {
            $global.currentPage = $global.pageText2 + capitalize($global.currentGroup);
            $global.isHome = 0;
        } else if (tabExp == "derivable") {
            $global.currentPage = $global.pageText3 + capitalize($global.currentDerivable);
            $global.isHome = 0;
        } else if (tabExp == "recent") {
            $global.currentPage = $global.pageText4;
            $global.isHome = 0;
        }

        $global.currentTab = tabExp;
        $global.updateTab(tabExp);
    };

});

aacApp.controller('otsControlPhrase', function ($scope, $http, $timeout, $global) {
    $scope.removeLastWord = function () {
        $global.currentPhrase.pop();
    }

    $scope.submitPhrase = function () {
        if ($global.currentPhrase.length > 0) {
            var i = 0;
            var currentPhraseString = "";
            $scope.currentPhraseTransition = "cpTransition";
            addPhrase2History($global.currentPhrase);

            $timeout(function () { $scope.currentPhraseTransition = ""; }, 300);
            while (i < $global.currentPhrase.length) {
                currentPhraseString = currentPhraseString + $global.currentPhrase[i].title + " ";
                i++;
            }
            otsimo.tts.speak(currentPhraseString);
            otsimo.customevent("app:phrase", { "phrase": currentPhraseString });
        }
    }



    var bstouchTimer;
    $scope.bsTouchStart = function () {
        document.getElementById("bs").style.color = "red";
        bstouchTimer = setTimeout(function () {
            $global.currentPhrase.splice(0, $global.currentPhrase.length);
            $scope.$apply();
        }, 500);
    }

    $scope.bsTouchEnd = function () {
        document.getElementById("bs").style.color = "#444";
        clearTimeout(bstouchTimer);
    }


});

aacApp.controller('otsControlGrid', function ($scope, $http, $timeout, $global) {


    $global.updateTab = function (tabExp) {
        if (tabExp == "main") {
            $global.groupPageNo = 0;
            $http.get(otsimo.kv.mainJsonPath).then(function (resp) {
                if (resp.status == 200) {
                    $scope.mainSymbolData = resp.data.main;

                    calcPageCount(resp.data.main.length);
                }
            });

        } else if (tabExp == "derivable") {
            //do nothing
        } else if (tabExp == "group") {
            var lengthFiltered = 0;
            var i = 0;
            $http.get("data/symbol.json").then(function (resp) {
                if (resp.status == 200) {
                    $scope.groupSymbolData = resp.data.symbols;
                    calcPageCountGroup(resp.data.symbols.filter(function(s){
                      return s.group_slug==$global.currentGroup;
                    }).length);

                }
            });

        } else if (tabExp == "recent") {
            $global.recentPhrases = getHistoryAsArray();
        }
    }

    function calcPageCount(len) {
        $global.mainMaxPageNo = len / $global.gridQuantity;
    }

    function calcPageCountGroup(len) {
        $global.groupMaxPageNo = Math.floor(len / $global.gridQuantity);
    }


    /*
    -- Card Navigation Functions (Click Functions)
    Functions to navigate between cards and group holders

    */

    $scope.groupClick = function (slug) {
        $global.currentGroup = slug;
        $global.changeCurrentTab("group");
        $global.updateGridQuantity();

        otsimo.customevent("app:group", { "group_slug": slug });
    }

    $scope.goBack = function () {
        $global.changeCurrentTab("main");
        $global.currentGroup = "";
        $global.updateGridQuantity();
    }

    $scope.goNextGroup = function () {
        $global.groupPageNo++;
        $global.updateGridQuantity();
    }

    $scope.goNextMain = function () {
        $global.mainPageNo++;
        $global.updateGridQuantity();
    }

    $scope.goPrevMain = function () {
        $global.mainPageNo--;
        $global.updateGridQuantity();
    }


    /*
    -- Word & Phrase Building Action Functions
    Functions to change (Addword, removeWord) and reflect changes to the currentPhrase.
    Functions to manage the interval of the recentPhrase history.

    */
    $scope.clickWord = function (wordObj) {
        $scope.add2Phrase(wordObj);
        updateCurrentPhraseScroll();
        otsimo.tts.speak(wordObj.title);
        otsimo.customevent("app:word", { "word": wordObj.title, "grid_x": $global.gridSize[0], "grid_y": $global.gridSize[1], "grid_xy": $global.gridSize[0] + "x" + $global.gridSize[1] });
    }
    $scope.touchWord = function (wordT, ind) {
        var wordElem;
        if (ind || ind === 0) {
            wordElem = document.getElementById("word-" + wordT + "-" + ind);
        } else {
            wordElem = document.getElementById("word-" + wordT);
        }
        wordElem.className = wordElem.className + " gridItemClick";
        setTimeout(function () {
            wordElem.className = wordElem.className.replace(" gridItemClick", "");
        }, 200);
    }


    $scope.add2Phrase = function (obj) {
        console.log("add2Phrase", $global.currentPhrase, obj);
        $global.currentPhrase.push(obj);
    }

    /*
    -- Touch Animations
    Functions to animate the hold and click actions
    on picture cards and backspace (bs) in the grid.
    */

    var wordTouchTimer;
    $scope.wordTouchStart = function (sytitle, deriveData, slug) {
        if (deriveData[0]) {
            wordTouchTimer = setTimeout(function () {
                document.getElementById("derivableCover").style.display = "block";
                $global.currentDerivable = sytitle;
                otsimo.customevent("app:derive", { "derivative": slug });
                $scope.derivableSymbolData = deriveData;
                $global.changeCurrentTab("derivable");
                $scope.$apply();
            }, 300);
        }
        var wordElem = document.getElementById("word-" + slug);
        wordElem.className = wordElem.className + " gridItemClick";
        setTimeout(function () {
            wordElem.className = wordElem.className.replace(" gridItemClick", "");
        }, 300);

    }

    $scope.wordTouchEnd = function (objMain, derivable) {
        clearTimeout(wordTouchTimer);
        if (!derivable) {
            $scope.clickWord(objMain);
        }
    }

    $scope.loadRecentPhrase = function (index) {
        var phraseHistory = getHistoryAsArray();
        var phrase2Add = phraseHistory[phraseHistory.length - (index + 1)].phrase;
        $global.currentPhrase = $global.currentPhrase.concat(phrase2Add);
    }

    $global.changeInterval = function (val) {
        var timeH;
        var timeC = returnTime();
        var timeL;
        if (val == 1) {
            timeH = timeC;
            timeL = timeC - 1000 * 60 * 30;
        } else if (val == 2) {
            timeH = timeC - 1000 * 60 * 30;
            timeL = timeC - 1000 * 60 * 60 * 24;
        } else if (val == 3) {
            timeH = timeC - 1000 * 60 * 30 * 24;
            timeL = timeC - 1000 * 60 * 60 * 24 * 2;
        } else if (val == 4) {
            timeH = timeC - 1000 * 60 * 30 * 24 * 2;
            timeL = timeC - 1000 * 60 * 60 * 24 * 7;
        }
        $scope.timeH = timeH;
        $scope.timeL = timeL;
        otsimo.customevent("app:time_interval", { "recent_time_interval": val });
    }


    $global.updateGridQuantity = function () {
        if ($global.currentTab != "main") {
            $global.gridQuantity = $global.gridSize[0] * $global.gridSize[1] - 1;
        } else {
            if ($global.mainPageNo == 0) {
                $global.gridQuantity = $global.gridSize[0] * $global.gridSize[1];
            } else {
                $global.gridQuantity = $global.gridSize[0] * $global.gridSize[1] - 1;
            }
        }
    }

    $global.changeGridSize = function (gridX, gridY) {
        $global.gridSize = [gridX, gridY];
        $global.gridSizeStatic = [gridX, gridY];
        $global.gridQuantity = gridX * gridY;
    };

    $global.checkOrientation = function () {

        var gridSizeTemp = $global.gridSizeStatic;
        if (window.orientation) {
            //production
            if (window.orientation == ORIENTATION_TOP || window.orientation == ORIENTATION_BOTTOM) {
                $global.gridSize = [gridSizeTemp[1], gridSizeTemp[0]];
                $scope.$apply();
            } else if (window.orientation == ORIENTATION_LEFT || window.orientation == ORIENTATION_RIGHT) {
                $global.gridSize = [gridSizeTemp[0], gridSizeTemp[1]];
                $scope.$apply();
            }
        } else {
            //development
            if (screen.orientation.type == "portrait-primary") {
                $global.gridSize = [gridSizeTemp[1], gridSizeTemp[0]];
                $scope.$apply();
            } else if (screen.orientation.type == "landscape-primary") {
                $global.gridSize = [gridSizeTemp[0], gridSizeTemp[1]];
                $scope.$apply();
            }
        }
    }
    window.addEventListener("orientationchange", function () {
        // Announce the new orientation number
        // console.log(screen.orientation.type);
        $global.checkOrientation();
    }, false);

});

aacApp.directive('header', function () {
    return {
        templateUrl: 'template/header.html'
    };
});

aacApp.directive('phrase', function () {
    return {
        templateUrl: 'template/phrase.html'
    };
});

aacApp.directive('grid', function () {
    return {
        templateUrl: 'template/grid.html'
    };
});
