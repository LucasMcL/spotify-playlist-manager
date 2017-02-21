angular.module('PlaylistDetailCtrl', [])

.controller('PlaylistDetailCtrl', function($scope, $state, $stateParams, Spotify, $ionicNavBarDelegate, $ionicPopup, $ionicPlatform, $ionicHistory, $cordovaToast, Playlists) {
  console.log('playlist detail control instantiated')

  // Grab variables from route paramaters
  // This is how I pass the information from PlaylistCtrl
  let listid = $stateParams.listid
  let userid = $stateParams.userid
  $scope.playlistTitle = $stateParams.listTitle

  $scope.editMode = false // toggled on and off
  $scope.changesMade = false // turned to true when first edit made
  $scope.orderCriteria = "none"
  $scope.descending = false
  let editLog = []

  $scope.tracks = []
  getTracks() // load tracks immediately

  /**
   * Get tracks for playlist using playlist id and user id
   */
  function getTracks() {
    Spotify.getPlaylist(userid, listid)
      .then(data => {
        $scope.tracks = data.tracks.items
      }).catch(error => {
        console.dir(error)
      })
  }

  /**
   * Utility functions for entering / exiting edit mode
   */
  function resetSortOptions() {
    $scope.orderCriteria = 'none'
    $scope.descending = false
  }

  function enterEditMode() {
    resetSortOptions()

    $scope.editMode = true
  }

  function exitEditMode() {
    resetSortOptions()

    $scope.editMode = false
    $scope.changesMade = false
  }

  /**
   * Display toast at bottom saying 'playlist saved'
   * Function called whenever playlist is saved
   */
  function showPlaylistSavedToast() {
    $cordovaToast.showWithOptions({
      message: "Playlist saved",
      duration: "short",
      position: "bottom",
      addPixelsY: -175  // move up above tabs
    }).catch(error => {
      console.log(error)
    })
  }

  /**
   * code to execute when user taps edit button
   * Calls saveChanges if attmpting to exiting edit mode
   * Toggles edit mode ON if not in edit mode
   */
  $scope.onEditButtonTap = function() {
    console.log('edit button tap')
    // If leaving edit mode...
    if($scope.editMode) {
      $scope.saveChanges()
    } else {
      enterEditMode()
    }
  }

  /**
   * Called when item is reordered on DOM
   * @param  {obj} item - object containing track info and metadata
   * @param  {integer} fromIndex - index where the object was in $scope.tracks
   * @param  {integer} toIndex - index where the object was moved to in $scope.tracks
   */
  $scope.onItemMove = function(item, fromIndex, toIndex) {
    $scope.tracks.splice(fromIndex, 1)
    $scope.tracks.splice(toIndex, 0, item)
    $scope.$apply()

    if(toIndex > fromIndex) toIndex++

    editLog.push({
      type: 'move',
      uri: item.track.uri,
      fromIndex,
      toIndex
    })

    $scope.changesMade = true
  }

  /**
   * Called when item deleted in DOM
   * @param  {obj} item - object containing track info and metadata
   */
  $scope.onItemDelete = function(item) {
    $scope.tracks.splice($scope.tracks.indexOf(item), 1)

    editLog.push({
      type: 'delete',
      uri: item.track.uri
    })

    $scope.changesMade = true
  }

   /**
   * Sorts $scope.tracks on different criteria
   * @param  {string} orderCriteria - value of select option
   */
  $scope.onSelectChange = function(orderCriteria) {
    $scope.orderCriteria = orderCriteria
    $scope.changesMade = true
    orderSongs()
  }

  /**
   * Run when user selects toggles the "descending" option
   * @param  {boolean} descending - state of the "descending" toggle
   */
  $scope.onDescendToggle = function(descending) {
    $scope.descending = descending
    $scope.changesMade = true
    orderSongs()
  }

  /**
   * attempts post of new playlist state to Spotify if changes were made
   */
  $scope.saveChanges = function() {
    if($scope.changesMade === false) {
      console.log('no changes made')
      exitEditMode()
    } else {
      console.log('save changes')
      // commitChange()
      // Get playlist songs, pass that info and locally saved playlist to commitChanges
      Spotify.getPlaylist(userid, listid)
        .then(data => {
          Playlists.commitChanges(data.tracks.items, $scope.tracks, userid, listid)
        }).catch(error => {
          console.dir(error)
        })
    }
  }

  /**
   * loops through array of edits and makes the requests Spotify, one after the other
   * Recursive, function called again after http request is successful
   */
  let editCounter = 0
  function commitChange() {
    // Exit recursive loop if you've reached (or accidentally exceeded) the array length
    if(editCounter >= editLog.length) {
      exitEditMode()
      showPlaylistSavedToast()
      editCounter = 0
      editLog = []
      return
    }
    // Make http call for deleting track, then loop back
    if(editLog[editCounter].type === "delete") {
      Spotify
        .removePlaylistTracks(userid, listid, editLog[editCounter].uri)
        .then(() => {
          console.log(`${editCounter}: delete sent`)
          editCounter++
          commitChange()
        })
    // Make http call for moving track, then loop back
    } else if(editLog[editCounter].type === "move") {
      Spotify.reorderPlaylistTracks(userid, listid, {
        range_start: editLog[editCounter].fromIndex,
        insert_before: editLog[editCounter].toIndex
      }).then(() => {
        console.log(`${editCounter}: move sent`)
        editCounter++
        commitChange()
      })
    }
  }

  /**
   * Code run when user selects "discard changes"
   * Gets current tracklist from Spotify and updates DOM
   */
  $scope.cancelChanges = function() {
    console.log('cancel changes')

    getTracks()
    exitEditMode()
  }

  /**
   * Called whenever "order by" is changed or "descnding" is changed
   * Sorts based on order criteria and whether user wants them to descend or not
   */
  function orderSongs() {
    console.log("$scope.orderCriteria", $scope.orderCriteria)
    console.log("$scope.descending", $scope.descending)

    let returnVal
    if($scope.descending === false) returnVal = -1
    else returnVal = 1

    switch($scope.orderCriteria) {
      case 'song':
        $scope.tracks.sort((a, b) => {
          if (a.track.name < b.track.name) return returnVal;
          if (a.track.name > b.track.name) return -returnVal;
          return 0;
        })
        break
      case 'artist':
        $scope.tracks.sort((a, b) => {
          if (a.track.artists[0].name < b.track.artists[0].name) return returnVal;
          if (a.track.artists[0].name > b.track.artists[0].name) return -returnVal;
          return 0;
        })
        break
      case 'album':
        $scope.tracks.sort((a, b) => {
          if (a.track.album.name < b.track.album.name) return returnVal;
          if (a.track.album.name > b.track.album.name) return -returnVal;
          return 0;
        })
        break
      case 'length':
        $scope.tracks.sort((a, b) => {
          if (a.track.duration_ms < b.track.duration_ms) return returnVal;
          if (a.track.duration_ms > b.track.duration_ms) return -returnVal;
          return 0;
        })
        break
    }
  } // end orderSongs()

  // Event Listeners
  // Save changes on exit app or view change
  $scope.$on("$ionicView.leave", $scope.saveChanges);
  $ionicPlatform.on('pause', $scope.saveChanges);
})



