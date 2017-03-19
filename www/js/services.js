'use strict';

angular.module('services', []).factory('Auth', function ($cordovaOauth, Spotify) {
  var CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891';
  var SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private'];

  //Public
  /**
   * Returns id of current user
   * @return {string} - user id of current user
   */
  function getCurrentUser() {
    return Spotify.getCurrentUser().then(function (user) {
      return user.id;
    }).catch(function (err) {
      return err;
    });
  }

  /**
   * Performs login using $cordovaOauth
   * @return {promise} - Returns promise that resolves after user logs in
   */
  function performLogin() {
    console.log('logging in');
    return $cordovaOauth.spotify(CLIENT_ID, SCOPE).then(function (result) {
      Spotify.setAuthToken(result.access_token);
    }, function (error) {
      console.error(error);
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
    console.log('checking for Auth');

    return Spotify.getCurrentUser().then(function () {
      return Promise.resolve();
    }).catch(function (err) {
      return performLogin();
    });
  }

  return {
    getCurrentUser: getCurrentUser,
    performLogin: performLogin,
    verify: verify
  };
}).factory('Playlists', function (Spotify, $cordovaToast, Auth) {
  /**
   * Fetches current user's id, then returns array of playlists
   * @return {array} - array of playlist objects
   */
  function get() {
    console.log('getting playlists');
    return Auth.getCurrentUser().then(function (userid) {
      return Spotify.getUserPlaylists(userid).then(function (data) {
        return data.items;
      });
    });
  }

  /**
   * Shows toast showing what playlist song was added to
   * @param  {string} playlistName - name of playlist song was added to
   */
  function showSongAddedToast(playlistName) {
    $cordovaToast.showWithOptions({
      message: 'Song added to ' + playlistName,
      duration: "short",
      position: "bottom",
      addPixelsY: -175 // move up above tabs
    }).catch(function (error) {
      console.log(error);
    });
  }

  /**
   * Takes locally saved track list and makes necessary reorder and delete requests to spotify
   * to update playlist
   * @param  {array} oldList - current state of playlist on Spotify before commiting changes
   * @param  {array} newList - locally saved array of track objects
   * @return {promise} - resolved promise when async calls are done
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

    var i = 0;
    var range_start = void 0;
    var insert_before = void 0;

    return new Promise(function (resolve, reject) {
      Spotify.removePlaylistTracks(userid, listid, deleted).then(function () {
        return reorderTracks();
      });

      function reorderTracks() {
        if (i > newUris.length - 1) {
          i = 0;
          resolve();
          return;
        }

        range_start = remaining.indexOf(newUris[i]);
        insert_before = i;

        if (range_start === insert_before) {
          // don't make AJAX request if already in right place
          console.log('match at ' + i);
          i++;
          updateRemaining();
          reorderTracks();
        } else {
          console.log(i + ': moving track from ' + range_start + ' to before ' + insert_before);
          Spotify.reorderPlaylistTracks(userid, listid, { range_start: range_start, insert_before: insert_before }).then(function () {
            i++;
            updateRemaining();
            reorderTracks();
          });
        }
      }
    });

    /**
     * Private function to update the local array to new state after a
     * single reorder has been completed
     */
    function updateRemaining() {
      var uri = remaining[range_start];
      remaining.splice(range_start, 1);
      remaining.splice(insert_before, 0, uri);
    }
  }

  return {
    get: get,
    showSongAddedToast: showSongAddedToast,
    commitChanges: commitChanges
  };
});