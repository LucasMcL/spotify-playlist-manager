angular.module('services', [])

.factory('Auth', function($cordovaOauth, Spotify) {
  const CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  const SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

  // Work in progress
  // Return promise that returns access token
  function performLogin() {
    console.log('performing login')
    $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function(result) {
      console.log("login successful")
      window.localStorage.setItem('spotify-token', result.access_token)
      Spotify.setAuthToken(result.access_token)
      $scope.updateInfo()
    }, function(error) {
      console.log('Error -> ' + error)
    })
  }


  // Private

})

.factory('Playlists', function(Spotify) {
  return {
    get: function(userid) {
      return Spotify.getUserPlaylists(userid).then(data => { return data.items })
    }
  }
})
