'use strict';

// Initialize app
// Inject dependencies
angular.module('playlist-manager', ['ionic', 'PlaylistDetailCtrl', 'PlaylistsCtrl', 'AccountCtrl', 'SearchCtrl', 'services', 'ngCordovaOauth', 'ngCordova', 'spotify']).run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
}).config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $urlRouterProvider.otherwise('/tab/playlists'); // default

  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack

  // Nav stack for manage playlists tab
  .state('tab.playlists', {
    url: '/playlists',
    views: {
      'tab-playlists': {
        templateUrl: 'templates/tab-playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  }).state('tab.playlists-detail', {
    url: 'playlists/:listid/:userid/:listTitle',
    views: {
      'tab-playlists': {
        templateUrl: 'templates/playlist-detail.html',
        controller: 'PlaylistDetailCtrl'
      }
    }
  })

  // Nav stack for Search tab
  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchCtrl'
      }
    }
  }).state('tab.artist-detail', {
    url: 'search/:artistid/:artistName/:artistImg/:userid',
    views: {
      'tab-search': {
        templateUrl: 'templates/artist-detail.html',
        controller: 'ArtistDetailCtrl'
      }
    }
  })

  // Nav stack for account tab
  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // Configure layout for Android and iPhone
  $ionicConfigProvider.tabs.position('bottom');
});