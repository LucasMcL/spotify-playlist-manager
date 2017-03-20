'use strict';

angular.module('PlaylistsCtrl', []).controller('PlaylistsCtrl', function ($scope, $ionicPlatform, $cordovaOauth, Spotify, Auth, Playlists) {
  console.log('playlist control instantiated');

  $scope.playlists = [];
  var userid = void 0;

  // Checks for auth on entering this view
  // After that, loads in playlists for that user
  $scope.$on("$ionicView.enter", function () {
    Auth.verify().then(function () {
      console.log('auth has done been checked in the playlist ctrl');
      Spotify.getCurrentUser().then(function (user) {
        userid = user.id;
        Playlists.get().then(function (playlists) {
          function isOwnedByUser(playlist) {
            return playlist.owner.id === userid;
          }
          $scope.playlists = playlists.filter(isOwnedByUser);
        });
      });
    });
  });
});