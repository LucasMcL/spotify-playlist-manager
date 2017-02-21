'use strict';

angular.module('PlaylistsCtrl', []).controller('PlaylistsCtrl', function ($scope, $ionicPlatform, $cordovaOauth, Spotify, Auth, Playlists) {
  console.log('playlist control instantiated');

  $scope.playlists = [];

  // Checks for auth on entering this view
  // After that, loads in playlists for that user
  $scope.$on("$ionicView.enter", function () {
    Auth.verify().then(function () {
      console.log('auth has done been checked in the playlist ctrl');
      Playlists.get().then(function (playlists) {
        $scope.playlists = playlists;
      });
    });
  });
});