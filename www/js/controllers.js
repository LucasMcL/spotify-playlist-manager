angular.module('controllers', [])

.controller('PlaylistsCtrl', function($scope, $ionicPlatform, $cordovaOauth, Spotify) {
  console.log('playlist control instantiated')

  let CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  let SCOPE = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private']

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

.controller('PlaylistDetailCtrl', function($scope, $state, $stateParams, Spotify, $ionicNavBarDelegate, $ionicPopup, $ionicPlatform, $ionicHistory, $cordovaToast) {
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

  $scope.tracks = []

  // Load in tracks when controller is instantiated
  getTracks()

  /**
   * Get tracks for playlist usig playlist id and user id
   */
  function getTracks() {
    Spotify.getPlaylist(userid, listid)
      .then(data => {
        $scope.tracks = data.tracks.items
      }).catch(error => {
        console.dir(error)
      })
  }

  function toggleEditMode() {
    $scope.editMode = !$scope.editMode

    // Reset these values when entering/exiting edit mode
    $scope.orderCriteria = 'none'
    $scope.descending = false
  }

  function showPlaylistSavedToast() {
    $cordovaToast.showWithOptions({
      message: "Playlist saved",
      duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
      position: "bottom",
      addPixelsY: -175  // added a negative value to move it up a bit (default 0)
    }).then(success => {
      console.log(success)
    }).catch(error => {
      console.log(error)
    })
  }

  // Called whenever "order by" is changed or "descnding" is changed
  // Sorts based on order criteria and whether user wants them to descend or not
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
  }

  $scope.onEditButtonTap = function() {
    console.log('edit button tap')
    if($scope.editMode) {
      $scope.saveChanges()
    } else {
      toggleEditMode()
    }
  }

  $scope.onItemMove = function(item, fromIndex, toIndex) {
    $scope.tracks.splice(fromIndex, 1)
    $scope.tracks.splice(toIndex, 0, item)
    $scope.$apply()

    $scope.changesMade = true
  }

  $scope.onItemDelete = function(item) {
    $scope.tracks.splice($scope.tracks.indexOf(item), 1)

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

  $scope.onDescendToggle = function(descending) {
    $scope.descending = descending
    $scope.changesMade = true
    orderSongs()
  }

  $scope.saveChanges = function() {
    if($scope.changesMade === false) {
      console.log('no changes made')
      toggleEditMode()
    } else {
      console.log('save changes')
      let uris = []
      $scope.tracks.forEach(item => uris.push(item.track.uri))
      Spotify
        .replacePlaylistTracks(userid, listid, uris)
        .then(data => {
          $scope.changesMade = false // reset after save
          toggleEditMode()
          showPlaylistSavedToast()
        })
        .catch(error => {
          alert('There was an error saving changes.  Please try again.')
          console.dir(error)
        })
    }
  }

  $scope.cancelChanges = function() {
    console.log('cancel changes')

    getTracks()
    toggleEditMode()
  }

  // Save playlist upon leaving view
  $scope.$on("$ionicView.leave", $scope.saveChanges);

  // Save playlist upon app going into background
  $ionicPlatform.on('pause', $scope.saveChanges);
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  console.log('chats ctrl instantiated')

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  console.log('chats detail ctrl instantiated')

  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $cordovaOauth, Spotify) {
  console.log('accounts ctrl instantiated')

  $scope.settings = {
    enableFriends: true
  };

})



