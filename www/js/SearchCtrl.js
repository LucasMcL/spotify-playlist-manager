'use strict';

angular.module('SearchCtrl', []).controller('SearchCtrl', function ($scope, Spotify, Playlists, Auth) {
  console.log('SearchCtrl instantiated');

  $scope.userid = "";
  $scope.trackResults = [];
  $scope.artistResults = [];
  $scope.playlists = [];

  // Perform auth check on view enter
  // Load in playlists after that resolves
  $scope.$on("$ionicView.enter", function () {
    Auth.verify().then(function () {
      console.log('Auth has done been checked in the search ctrl');
      Playlists.get().then(function (playlists) {
        return $scope.playlists = playlists;
      });
    });
  });

  var SEARCH_BY = 'artist,track';

  $scope.onSubmit = function (query) {

    Spotify.search(query, SEARCH_BY, { limit: 5 }).then(function (data) {
      $scope.trackResults = data.tracks.items;
      $scope.artistResults = data.artists.items;
    });
  };
}).controller('ArtistDetailCtrl', function ($scope, Spotify, $stateParams) {
  $scope.artistid = $stateParams.artistid;
  $scope.artistName = $stateParams.artistName;
  $scope.userid = $stateParams.userid;
});