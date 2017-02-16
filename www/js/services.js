angular.module('services', [])

.factory('Auth', function($cordovaOauth, Spotify) {
  const CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  const SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

  return {
    getCurrentUser: function() {
      return Spotify.getCurrentUser().then(user => { return user.id })
    },
    verifyToken: function() {
      let storedToken = window.localStorage.getItem('spotify-token')
      console.log('checking for stored token')
      if(storedToken) {
        Spotify.setAuthToken(storedToken)
        console.log('Stored token found')
      } else {
        console.log('Stored token not found.  Prompting user for login')
        Auth.performLogin()
      }
    },
    performLogin: function() {
      $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function(result) {
        console.log("login successful")
        window.localStorage.setItem('spotify-token', result.access_token)
        Spotify.setAuthToken(result.access_token)
      }, function(error) {
        console.dir(error)
      })
    }
  }
})

.factory('Playlists', function(Spotify, Auth) {
  return {
    /**
     * Fetches current user's id, then returns array of playlists
     * @return {array} - array of playlist objects
     */
    get: function() {
      return Auth.getCurrentUser().then(userid => {
        return Spotify.getUserPlaylists(userid).then(data => data.items)
      })
    },
    /**
     * Fetches current user's id, then playlists, then returns array of playlist ids
     * @return {array} - array of playlist ids
     */
    getIds: function() {
      return Auth.getCurrentUser().then(userid => {
        return Spotify.getUserPlaylists(userid).then(data => {
          let ids = []
          data.items.forEach(item => ids.push(item.id))
          return ids
        })
      })
    }
  }
})
