/*
  -- recent.js
  Directive and controller for phrase history in the app;

*/

aacApp.directive('recent', function () {
    return {
        templateUrl: 'template/recent.html'
    };
});

aacApp.controller('otsControlRecent', function ($scope, $global) {
    $scope.loadRecentPhrase = function (index) {
        var phraseHistory = $scope.recentPhrasesList;
        var phrase2Add = phraseHistory[phraseHistory.length - (index + 1)].phrase;
        $global.currentPhrase = $global.currentPhrase.concat(phrase2Add); 
    }

    $scope.changeInterval = function (val) {
        var timeH;
        var timeC = returnTime();
        var timeL;
        const halfHour = 1000 * 60 * 30;
        const oneDay = halfHour * 2 * 24;
        const oneWeek = oneDay * 7;
        if (val == 1) {
            timeH = timeC;
            timeL = timeC - halfHour;
        } else if (val == 2) {
            timeH = timeC - halfHour;
            timeL = timeC - oneDay;
        } else if (val == 3) {
            timeH = timeC - oneDay;
            timeL = timeC - oneDay * 2;
        } else if (val == 4) {
            timeH = timeC - oneDay * 2;
            timeL = timeC - oneWeek;
        }
        $scope.recentPhrasesList = $global.recentPhrases.filter(function(phraseRecent){
            return phraseRecent.time < timeH && phraseRecent.time > timeL;
         });
        otsimo.customevent("app:time_interval", { "recent_time_interval": val });
    }

    $scope.changeInterval(1);

});
