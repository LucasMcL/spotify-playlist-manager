'use strict';

angular.module('SearchCtrl', []).controller('SearchCtrl', function ($scope, $ionicPopover, $cordovaToast, Spotify, Playlists, Auth) {
  console.log('SearchCtrl instantiated');

  $scope.userid = "";
  $scope.trackResults = [];
  $scope.artistResults = [];
  $scope.playlists = [];
  $scope.searchPerformed = false;
  var trackUri = "";

  // Perform auth check on view enter
  // Load in playlists after that resolves
  // Save current user id
  $scope.$on("$ionicView.enter", function () {
    Auth.verify().then(function () {
      console.log('Auth has done been checked in the search ctrl');
      Playlists.get().then(function (playlists) {
        return $scope.playlists = playlists;
      });
      Auth.getCurrentUser().then(function (id) {
        return $scope.userid = id;
      });
    });
  });

  // Compile popover template and save to scope
  $ionicPopover.fromTemplateUrl('templates/popover/add-to-playlist.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });

  /**
   * Show list of playlists when user clicks add button
   * Saves track uri as local variable
   * @param  {obj} $event - Event object to bind the popover to
   * @param  {string} uri - Track uri from track that was clicked
   */
  $scope.onAddButtonClick = function ($event, uri) {
    $scope.popover.show($event);
    trackUri = uri;
  };

  /**
   * Add song to playlist that was clicked on
   * Show toast when that completes
   * @param  {obj} playlist - Object containing playlist details and metadata
   */
  $scope.onPlaylistClick = function (playlist) {
    var playlistid = playlist.id;
    var playlistName = playlist.name;
    $scope.popover.hide();
    Spotify.addPlaylistTracks($scope.userid, playlistid, trackUri).then(function () {
      return Playlists.showSongAddedToast(playlistName);
    }).catch(function (error) {
      return alert('There was an error adding to that playlist');
    });
  };

  /**
   * Fetches search results on form submission
   * @param  {string} query - Search query from user
   */
  $scope.onSubmit = function (query) {
    var SEARCH_BY = 'artist,track';
    $scope.searchPerformed = true;

    Spotify.search(query, SEARCH_BY, { limit: 5 }).then(function (data) {
      $scope.trackResults = data.tracks.items;
      $scope.artistResults = data.artists.items;
    });
  };
}).controller('ArtistDetailCtrl', function ($scope, $stateParams, $ionicPopover, Spotify, Auth, Playlists) {
  var artistid = $stateParams.artistid;
  $scope.artistName = $stateParams.artistName;
  $scope.userid = $stateParams.userid;
  $scope.artistImg = $stateParams.artistImg;
  $scope.tracks = [];
  $scope.playlists = [];
  var trackUri = void 0;

  // Perform auth check on view enter
  // Load in playlists after that resolves
  // Save current user id
  $scope.$on("$ionicView.enter", function () {
    Auth.verify().then(function () {
      console.log('Auth has done been checked in the artist detail ctrl');
      Spotify.getArtistTopTracks(artistid, 'US').then(function (response) {
        return $scope.tracks = response.tracks;
      });
      Playlists.get().then(function (playlists) {
        return $scope.playlists = playlists;
      });
    });
  });

  // Compile popover template and save to scope
  $ionicPopover.fromTemplateUrl('templates/popover/add-to-playlist.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });

  $scope.onAddButtonClick = function ($event, uri) {
    $scope.popover.show($event);
    trackUri = uri;
  };

  /**
   * Add song to playlist that was clicked on
   * Show toast when that completes
   * @param  {obj} playlist - Object containing playlist details and metadata
   */
  $scope.onPlaylistClick = function (playlist) {
    var playlistid = playlist.id;
    var playlistName = playlist.name;
    $scope.popover.hide();
    Spotify.addPlaylistTracks($scope.userid, playlistid, trackUri).then(function () {
      return Playlists.showSongAddedToast(playlistName);
    }).catch(function (error) {
      return alert('There was an error adding to that playlist');
    });
  };
});