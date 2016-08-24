/*
  -- keyboard.js
  Directive and controller for the words the user input via keyboard;

*/

aacApp.directive('keyboard', function () {
    return {
        templateUrl: 'template/keyboard.html'
    };
});

aacApp.controller('otsControlKeyboard', function ($scope, $global) {

  $scope.showKeyboard = function(){
    document.getElementById("typeInput").focus();
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    $scope.showKeyboardFocused();
  };

  $scope.showKeyboardFocused = function(){
    document.getElementById("typeInput").removeAttribute('readonly');
      setTimeout(function(){
        document.body.style.height = parseInt(window.innerHeight)+'px';
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        console.log("virtual keyboard opened!");
      }, 300);
    };

  $scope.hideKeyboard = function(){
      document.body.style.height = "100%";
  };

  $scope.submitCurrentInput = function(){
      var typeInput = document.getElementById("typeInput");
      if(typeInput.value){
        var inputWord = {};
        inputWord.title = typeInput.value.toLowerCase();
        inputWord.slug = typeInput.value.toLowerCase().replace(" ", "-");
        var checkExist = $global.checkWordInDB(inputWord.slug);
        inputWord.slugExist = !checkExist;

        if(inputWord.title.contains(" ") && !checkExist){
          recognizeWord(inputWord.title);
        }else{
          $global.currentPhrase.push(inputWord);
        }

        updateCurrentPhraseScroll();
        otsimo.tts.speak(inputWord.title);
        typeInput.value = "";
      }
  };

  $scope.enterSubmit = function($event){
    if($event.keyCode == 13){
      $scope.submitCurrentInput();
      $scope.suggestionList = [];
    }else{
      var typeInput = document.getElementById("typeInput");
      setTimeout(function(){
        if(typeInput.value.length > 1){
          suggestWordsByInput(typeInput.value);
        }else{
          $scope.suggestionList = [];
        }
      },10);
    }
  }

  $scope.clickSuggestion = function(wordSlug){
    var wordObj2Push = {};
    wordObj2Push.title = wordSlug.replace("-", " ");
    wordObj2Push.slug = wordSlug;
    $global.currentPhrase.push(wordObj2Push);

    document.getElementById("typeInput").value = "";
    $scope.suggestionList = [];
  }

  var recognizeWord = function(word){
    // this function can be better!
    var splittedUnrecognizedWord = word.split(" ");
    splittedUnrecognizedWord.forEach(function(wordPiece){
      if(wordPiece){
        var wordObj2Push = {};
        wordObj2Push.title = wordPiece;
        wordObj2Push.slug = wordPiece;
        wordObj2Push.slugExist = !$global.checkWordInDB(wordObj2Push.slug);
        $global.currentPhrase.push(wordObj2Push);
      }
    });
  }

  var suggestWordsByInput = function(searchLetter){
      searchLetter = searchLetter.replace(" ", "-");
    $scope.suggestionList = $global.mainSlugArray.filter(function(word){
      return word.substring(0, searchLetter.length) == searchLetter;
    });
    if($scope.suggestionList.length > 0){
      $scope.suggestionList.sort(sortByLength);
    }
    $scope.$apply();
  }


$scope.$watch('$viewContentLoaded', function(){
  $scope.showKeyboard();
 });

 $global.checkWordInDB = function(word){
   return $global.mainSlugArray.contains(word);
 }

});
