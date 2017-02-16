angular.module('PlaylistsCtrl', [])

.controller('PlaylistsCtrl', function($scope, $ionicPlatform, $cordovaOauth, Spotify) {
  console.log('playlist control instantiated')

  const CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  const SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

  $scope.playlists = []

  $ionicPlatform.ready(function() {
    let storedToken = window.localStorage.getItem('spotify-token')
    // let storedToken = null
    console.log('checking for stored token')
    if(storedToken) {
      Spotify.setAuthToken(storedToken)
      $scope.updateInfo()
      console.log('Stored token found')
    } else {
      $scope.performLogin()
    }
  })

  $scope.performLogin = function() {
    $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function(result) {
      console.log("login successful")
      window.localStorage.setItem('spotify-token', result.access_token)
      Spotify.setAuthToken(result.access_token)
      $scope.updateInfo()
    }, function(error) {
      console.log('Error -> ' + error)
    })
  }

  $scope.updateInfo = function() {
    Spotify.getCurrentUser().then(function (data) {
      $scope.getUserPlaylists(data.id)
    }, function(error) {
      $scope.performLogin()
    })
  }

  $scope.getUserPlaylists = function(userid) {
    Spotify.getUserPlaylists(userid).then(function (data) {
      $scope.playlists = data.items;
    })
  }
})
