/*
  -- grid.js
  Directive and controller for grids and the grid elements;

*/

aacApp.factory('$symbol', function ($http, $global) {
    var main;
    $http.get("data/main_en.json").then(function (resp) {
        $global.main = resp.data.symbols;
    });

    return {
        main: 1
    };
});

const PAGE_DERIVABLE = "derivable";
const PAGE_MAIN = "main";
const PAGE_GROUP = "group";
const PAGE_RECENT = "recent";

const CLASS_MAIN="main";

aacApp.directive('grid', function () {
    return {
        templateUrl: 'template/grid.html'
    };
});

aacApp.controller('otsControlGrid', function ($scope, $http, $timeout, $global, $symbol) {

    $scope.PageNo = 0;
    $scope.MaxPageNo = 0;
    
    $scope.tabs = {};

    $scope.tabs[PAGE_MAIN] = function () {
        var symbolQuantity = 0;
        if ($scope.PageNo === 0) {
            symbolQuantity = $global.gridQuantity - 1;
        } else {
            symbolQuantity = $global.gridQuantity - 2;
        }
        $scope.mainDataUnpaged = $global.main.filter(function (f) {
            return (f.parent == CLASS_MAIN)
        });
        sliceArray(symbolQuantity);
    }

    $scope.tabs[PAGE_DERIVABLE] = function () {
        $scope.PageNo = 0;
        var symbolQuantity = $global.gridQuantity - 2;
        $scope.mainDataUnpaged = $global.main.filter(function (f) {
            return (f.parent == $global.currentDerivable)
        });
        sliceArray(symbolQuantity);
    }

    $scope.tabs[PAGE_GROUP] = function () {
        $scope.PageNo = 0;
        var symbolQuantity = $global.gridQuantity - 2;
        $scope.mainDataUnpaged = $global.main.filter(function (f) {
            return (f.parent == $global.currentGroup)
        });
        sliceArray(symbolQuantity);
    }

    $scope.tabs[PAGE_RECENT] = function () {
        $global.recentPhrases = getHistoryAsArray();
    }

    $global.changeTab = function (tabExp) {
        var t = $scope.tabs[tabExp];
        if (t) {
            t();
        } else {
            console.error(tabExp, " unknown tab");
        }
    }
    var sliceArray = function(symbolQuantity){
      $scope.mainData = $scope.mainDataUnpaged.slice($scope.PageNo * symbolQuantity, ($scope.PageNo + 1) * symbolQuantity).map(mapStyle);
      $scope.MaxPageNo = returnMaxPage();
    }

    var mapStyle = function(symbol){
        if(symbol.class == "group"){
          symbol.style = "gridGroup";
        }else{
          symbol.style = "gridType-"+symbol.type;
        }
        return symbol;
    }
    var returnMaxPage = function () {
        return parseInt($scope.mainDataUnpaged.length / $global.gridQuantity);
    }


    $scope.goBack = function () {
        $global.changeCurrentTab(PAGE_MAIN);
        $global.currentGroup = "";
    }

    $scope.goNextMain = function () {
        $scope.PageNo++;
        $global.changeTab(PAGE_MAIN);
    }

    $scope.goPrevMain = function () {
        $scope.PageNo--;
        $global.changeTab(PAGE_MAIN);
    }



    $global.updateGridQuantity = function () {
        if ($global.currentTab != PAGE_MAIN) {
            $global.gridQuantity = $global.gridSize[0] * $global.gridSize[1] - 1;
        } else {
            if ($scope.PageNo == 0) {
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
