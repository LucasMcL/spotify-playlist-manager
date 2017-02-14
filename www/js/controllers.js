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

.controller('PlaylistDetailCtrl', function($scope, $state, $stateParams, Spotify, $ionicNavBarDelegate, $ionicPopup, $ionicPlatform, $ionicHistory) {
  console.log('playlist detail control instantiated')

  // Grab variables from route paramaters
  // This is how I pass the information from PlaylistCtrl
  let listid = $stateParams.listid
  let userid = $stateParams.userid
  $scope.playlistTitle = $stateParams.listTitle

  $scope.editMode = false // toggled on and off

  $scope.tracks = []
  $scope.audio = new Audio()

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

    // Hide back button when editing
    $ionicNavBarDelegate.showBackButton(!$scope.editMode)
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
    $scope.tracks.splice(fromIndex, 1);
    $scope.tracks.splice(toIndex, 0, item);
    $scope.$apply()
  }

  $scope.onItemDelete = function(item) {
    $scope.tracks.splice($scope.tracks.indexOf(item), 1)
  }

  // Not being used currently
  $scope.playTrack = function(item) {
    $scope.audio.src = item.track.preview_url
    // $scope.audio.play()
  }

  $scope.saveChanges = function() {
    console.log('save changes')
    let uris = []
    $scope.tracks.forEach(item => uris.push(item.track.uri))
    Spotify
      .replacePlaylistTracks(userid, listid, uris)
      .then(data => {
        console.log(data)
        toggleEditMode()
      })
      .catch(error => {
        alert('There was an error saving changes.  Please try again.')
        console.dir(error)
      })
  }

  $scope.cancelChanges = function() {
    console.log('cancel changes')
    getTracks()
    toggleEditMode()
  }

  // Display popup asking if user wants to leave
  $ionicPlatform.registerBackButtonAction(function () {
    if($state.current.name === 'tab.playlists-detail' && $scope.editMode) {
      var confirmExit = $ionicPopup.confirm({
        title: 'Before you leave',
        template: 'Leave without saving?',
        cancelText: 'Leave',
        okText: 'Stay'
      })
      confirmExit.then(function(res) {
        if(res) console.log('user chose to stay')
        else $ionicHistory.goBack()
      })
    }
    else {
      $ionicHistory.goBack()
    }
  }, 100)


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



