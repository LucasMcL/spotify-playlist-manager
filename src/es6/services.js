angular.module('services', [])

.factory('Auth', function($cordovaOauth, Spotify) {
  const CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  const SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

  //Private
  /**
   * Utility function valled by verifyToken
   * @return {promise} - Returns promise that resolves after user logs in
   */
  function performLogin() {
    return $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function(result) {
      window.localStorage.setItem('spotify-token', result.access_token)
      Spotify.setAuthToken(result.access_token)
    }, function(error) {
      console.dir(error)
    })
  }

  //Public
  /**
   * Returns id of current user
   * @return {string} - user id of current user
   */
  function getCurrentUser() {
    return Spotify.getCurrentUser().then(user => { return user.id })
  }

  /**
   * Performed upon entry to every view in app
   * Does these things:
   *   -Checks for stored auth token
   *   -Sets auth token if stored token found
   *   -If not found, prompts user for login then sets auth token
   * @return {Promise} - Returns promise either after token is found, or after login succeeded
   */
  function verify() {
    let storedToken = window.localStorage.getItem('spotify-token')
    console.log('checking for Auth')
    if(storedToken) {
      Spotify.setAuthToken(storedToken)
      return Promise.resolve()
    } else {
      return performLogin()
    }
  }

  return {
    getCurrentUser,
    verify
  }
})

.factory('Playlists', function(Spotify, Auth) {
  /**
   * Fetches current user's id, then returns array of playlists
   * @return {array} - array of playlist objects
   */
  function get() {
    return Auth.getCurrentUser().then(userid => {
      return Spotify.getUserPlaylists(userid).then(data => data.items)
    })
  }

  /**
   * Fetches current user's id, then playlists, then returns array of playlist ids
   * @return {array} - array of playlist ids
   */
  function getIds() {
    return Auth.getCurrentUser().then(userid => {
      return Spotify.getUserPlaylists(userid).then(data => {
        let ids = []
        data.items.forEach(item => ids.push(item.id))
        return ids
      })
    })
  }

  function getNames() {
    return Auth.getCurrentUser().then(userid => {
      return Spotify.getUserPlaylists(userid).then(data => {
        let names = []
        data.items.forEach(item => names.push(item.name))
        return names
      })
    })
  }

  /**
   * Takes locally saved track list and makes necessary reorder and delete requests to spotify
   * to update playlist
   * @param  {array} oldList - current state of playlist on Spotify before commiting changes
   * @param  {array} newList - locally saved array of track objects
   * @return {promise} - resolved promise when async calls are done
   */
  function commitChanges(oldList, newList, userid, listid) {
    console.log('commitChanges function called')
    let oldUris = []
    let newUris = []
    oldList.forEach(item => oldUris.push(item.track.uri))
    newList.forEach(item => newUris.push(item.track.uri))

    let deleted = oldUris.filter(x => newUris.indexOf(x) == -1)
    let remaining = oldUris.filter(x => newUris.indexOf(x) >= 0)

    let i = 0
    let range_start
    let insert_before

    return new Promise((resolve, reject) => {
      Spotify
        .removePlaylistTracks(userid, listid, deleted)
        .then(() => reorderTracks())

      function reorderTracks() {
        if(i > newUris.length - 1) {
          i = 0
          resolve()
          return
        }
        range_start = remaining.indexOf(newUris[i])
        insert_before = i
        console.log(`${i}: moving track from ${range_start} to before ${insert_before}`)

        Spotify
          .reorderPlaylistTracks(userid, listid, {range_start, insert_before})
          .then(() => {
            i++
            updateRemaining()
            reorderTracks()
          })
      }
    })

    /**
     * Private function to update the local array to new state after a
     * single reorder has been completed
     */
    function updateRemaining() {
      let uri = remaining[range_start]
      remaining.splice(range_start, 1)
      remaining.splice(insert_before, 0, uri)
    }
  }

  return {
    get,
    getIds,
    getNames,
    commitChanges
  }
})














