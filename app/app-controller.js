import { turkishConjunctor } from './js/fiil';
import { englishConjunctor } from './js/verb';
import { deviceType } from './js/utils';
import * as CONSTANT from './js/constants';
/**
 *
 * @class AppController
 */
export default class AppController {
  /**
   * Creates an instance of AppController.
   *
   * @param {any} $scope
   * @param {any} $global
   * @param {angular.IHttpService} $http
   * @param {TTSManager} TTSManager
   * @param {any} OtsimoHandler
   *
   * @memberOf AppController
   */
  constructor($scope, $global, $http, TTSManager, OtsimoHandler) {
    this.$scope = $scope;
    this.$scope.global = $global;
    this.$http = $http;
    this.tts = TTSManager;
    this.otsimo = OtsimoHandler.init();
    // Initilize variables for controller.

    // Call controllerInit
    this.controllerInit();
  }

  controllerInit() {
    // Create or facilitate new functions for $scope or $global service.
    this.otsimo.run(() => {

      this.checkCapabilities();
      this.setSettings();
      this.runApp();
    });

    // Listen the changes on the resolution and
    // orientation from the device.
    this.resolutionListener();
  }

  /**
   * Does the inital tasks to start the app.
   */
  runApp() {
    // Get grid size X and Y from otsimo settings object.
    let otsGridSize = this.otsimo.settings.gridsize.split('grid-')[1];
    let otsGridXY = otsGridSize.split('x');
    let x = otsGridXY[0];
    let y = otsGridXY[1];
    // Check if the device is a phone
    // Limit the grid size to 6x4
    if (deviceType() === 'phone') {
      if (x > 6) { x = 6; }
      if (y > 4) { y = 4; }
    }
    // Set grid size and check device orientation.
    this.$scope.global.changeGridSize(x, y);
    if (this.otsimo.width < this.otsimo.height) {
      this.$scope.global.checkOrientation(CONSTANT.PORTRAIT);
    } else {
      this.$scope.global.checkOrientation(CONSTANT.LANDSCAPE_LEFT);
    }

    // Load symbol data to global array variable.
    this.loadSymbols();
  }

  /**
   * Sets the setting properties fron otsimo object
   *
   */
  setSettings() {

    this.$scope.global.language = this.otsimo.child.language;
    // Colors & styles
    this.$scope.headerColor = this.otsimo.kv.headerColor;
    this.$scope.generalFont = this.otsimo.kv.generalFont;
    let header = document.getElementById('header');
    if (header) {
      header.style.background = this.$scope.headerColor;
      document.body.style.fontSize = this.$scope.generalFont;
    }

    this.setUIText();

  }

  /**
   * Loads symbol package respect to language
   *
   */
  loadSymbols() {
    let global = this.$scope.global;
    let metadataPath = `${this.otsimo.kv.symbolPack}/metadata.json`;
    this.$http.get(metadataPath)
      .success((resp) => {
        this.metadata = resp;
        global.symbolPath = `${this.otsimo.kv.symbolPack}/${resp.images}`;
        this.tts.setVoiceDriver(resp.voiceId);

        let symbolDataPath = `${this.otsimo.kv.symbolPack}/${resp.data}`

        this.$http.get(symbolDataPath)
          .success(resp => {
            global.mainArray = resp.symbols;
            this.initExtendedSymbols();
            global.changeCurrentTab(CONSTANT.TAB_MAIN);
          })
          .error(console.error);
      })
      .error(console.error);
  }

  /**
   * Initilizes the extended symbol array for phrase view.
   *
   */
  initExtendedSymbols() {
    let global = this.$scope.global;
    if (global.mainArray) {
      global.mainArray.forEach(objMirror => {
        let obj = JSON.parse(JSON.stringify(objMirror));
        global.extendedArray.push(obj);
        global.extendedSlugMap[obj.title] = obj.slug;
        // Extend synonyms
        if (obj.synonym.length) {
          obj.synonym.forEach(s => {
            obj.title = s;
            let pushObj = JSON.parse(JSON.stringify(obj));
            global.extendedArray.push(pushObj);
            global.extendedSlugMap[pushObj.title] = obj.slug;
          });
        }
        // Extend conjuncted
        if (obj.type == "verb") {
          let lang = this.$scope.global.language;
          if (lang == "tr") {
            let possessors = ["ben", "sen", "o"];
            possessors.forEach(p => {
              CONSTANT.CONJTYPE["tr"].forEach(c => {
                obj.title = turkishConjunctor(obj.slug, c, p);
                console.log(obj);
                let pushObj = JSON.parse(JSON.stringify(obj));
                global.extendedArray.push(pushObj);
                global.extendedSlugMap[pushObj.title] = obj.slug;
              });
            });
          } else if (lang == "en") {
            //Set english verb conjunction.
          }
        }
      });
    }
    global.extendedArray.forEach(ext => {
      global.extendedTitleArray.push(ext.title);
      global.extendedSlugArray.push(ext.slug);
    });
  }

  /**
   * Checks if the device or installed otsimo app is supporting TTS.
   *
   */
  checkCapabilities() {
    if (this.otsimo.capabilities.indexOf('tts') === -1) {
      document.getElementById('outdated').style.display = 'block';
    }
  }

  /**
   * Sets UI text setting properties from otsimo kv object
   *
   */
  setUIText() {
    this.$scope.pageText1 = this.otsimo.kv.pageText1;
    this.$scope.pageText2 = this.otsimo.kv.pageText2;
    this.$scope.pageText3 = this.otsimo.kv.pageText3;
    this.$scope.pageText4 = this.otsimo.kv.pageText4;
    this.$scope.pageText5 = this.otsimo.kv.pageText5;
    this.$scope.timeIntervalText1 = this.otsimo.kv.timeIntervalText1;
    this.$scope.timeIntervalText2 = this.otsimo.kv.timeIntervalText2;
    this.$scope.timeIntervalText3 = this.otsimo.kv.timeIntervalText3;
    this.$scope.timeIntervalText4 = this.otsimo.kv.timeIntervalText4;
    this.$scope.previousText = this.otsimo.kv.previousText;
    this.$scope.nextText = this.otsimo.kv.nextText;
    this.$scope.backText = this.otsimo.kv.backText;
    this.$scope.removeHoldColor = this.otsimo.kv.removeHoldColor;
    this.$scope.removeNormalColor = this.otsimo.kv.removeNormalColor;
    this.$scope.startTyping = this.otsimo.kv.startTyping;
  }

  /**
   * Listens any resolution changes
   *
   */
  resolutionListener() {
    this.otsimo.onResolutionChanged((width, height, orientation) => {
      if (width < height) {
        this.$scope.global.checkOrientation(CONSTANT.PORTRAIT);
      } else {
        this.$scope.global.checkOrientation(CONSTANT.LANDSCAPE_LEFT);
      }
    });
  }

}
// Service Dependency Injection
AppController.$inject = ['$scope', '$global', '$http', 'TTSManager', 'OtsimoHandler'];
