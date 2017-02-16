angular.module('GenieCtrl', [])

.controller('AccountCtrl', function($scope, $cordovaOauth, Spotify) {
  console.log('accounts ctrl instantiated')

  const CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  const SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

  $scope.settings = {
    enableFriends: true
  };

  $scope.clearCookies = function() {
  	console.log('clearing cookies')
  	localStorage.removeItem("spotify-token");
  }
})
