'use strict';

angular.module('services', []).factory('Auth', function ($cordovaOauth, Spotify) {
  var CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891';
  var SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private'];

  //Private
  /**
   * Utility function valled by verifyToken
   * @return {promise} - Returns promise that resolves after user logs in
   */
  function performLogin() {
    return $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function (result) {
      window.localStorage.setItem('spotify-token', result.access_token);
      Spotify.setAuthToken(result.access_token);
    }, function (error) {
      console.dir(error);
    });
  }

  //Public
  /**
   * Returns id of current user
   * @return {string} - user id of current user
   */
  function getCurrentUser() {
    return Spotify.getCurrentUser().then(function (user) {
      return user.id;
    });
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
    var storedToken = window.localStorage.getItem('spotify-token');
    console.log('checking for Auth');
    if (storedToken) {
      Spotify.setAuthToken(storedToken);
      return Promise.resolve();
    } else {
      return performLogin();
    }
  }

  return {
    getCurrentUser: getCurrentUser,
    verify: verify
  };
}).factory('Playlists', function (Spotify, Auth) {
  return {
    /**
     * Fetches current user's id, then returns array of playlists
     * @return {array} - array of playlist objects
     */
    get: function get() {
      return Auth.getCurrentUser().then(function (userid) {
        return Spotify.getUserPlaylists(userid).then(function (data) {
          return data.items;
        });
      });
    },
    /**
     * Fetches current user's id, then playlists, then returns array of playlist ids
     * @return {array} - array of playlist ids
     */
    getIds: function getIds() {
      return Auth.getCurrentUser().then(function (userid) {
        return Spotify.getUserPlaylists(userid).then(function (data) {
          var ids = [];
          data.items.forEach(function (item) {
            return ids.push(item.id);
          });
          return ids;
        });
      });
    },
    commitChanges: commitChanges
  };

  /**
   * Takes locally saved track list and makes necessary reorder and delete requests to spotify
   * to update playlist
   * @param  {array} oldList - current state of playlist on Spotify before commiting changes
   * @param  {array} newList - locally saved array of track objects
   */
  function commitChanges(oldList, newList, userid, listid) {
    console.log('commitChanges function called');
    var oldUris = [];
    var newUris = [];
    oldList.forEach(function (item) {
      return oldUris.push(item.track.uri);
    });
    newList.forEach(function (item) {
      return newUris.push(item.track.uri);
    });

    var deleted = oldUris.filter(function (x) {
      return newUris.indexOf(x) == -1;
    });
    var remaining = oldUris.filter(function (x) {
      return newUris.indexOf(x) >= 0;
    });

    Spotify.removePlaylistTracks(userid, listid, deleted).then(function () {
      return reorderTracks();
    });

    var i = 0;
    var range_start = void 0;
    var insert_before = void 0;
    function reorderTracks() {
      if (i > newUris.length - 1) {
        i = 0;
        return;
      }
      range_start = remaining.indexOf(newUris[i]);console.log(range_start);
      insert_before = i;
      console.log(i + ': moving track from ' + range_start + ' to before ' + insert_before);

      Spotify.reorderPlaylistTracks(userid, listid, { range_start: range_start, insert_before: insert_before }).then(function () {
        i++;
        updateRemaining();
        reorderTracks();
      });
    }

    /**
     * Utility function to update the local array to new state after a
     * single reorder has been completed
     */
    function updateRemaining() {
      var uri = remaining[range_start];
      remaining.splice(range_start, 1);
      remaining.splice(insert_before, 0, uri);
    }
  }
});