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

.controller('PlaylistDetailCtrl', function($scope, $stateParams, Spotify) {
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

  $scope.toggleEditMode = function() {
    $scope.editMode = !$scope.editMode
  }

  // Makes the call to Spotify to reorder a song
  /**
   * @param  {object} item - item being moved
   * @param  {[integer]} - index in ion-list item WAS in
   * @param  {[integer]} - index in ion-list item moved to
   * @return {[object]} - response from api call or error
   */
  $scope.onItemMove = function(item, fromIndex, toIndex) {
    Spotify.reorderPlaylistTracks(userid, listid, {
      range_start: fromIndex,
      insert_before: toIndex + 1
    })
      .then(response => {
        console.dir(response)
        getTracks()
      })
      .catch(error => {
        console.log("error from moving playlist track:")
        console.dir(error)
        alert('There was an error reordering.  Please try again.')
      })
  }

  /**
   * @param  {object} item - object that contains track info and metadata
   */
  $scope.onItemDelete = function(item) {
    let uri = item.track.uri
    Spotify.removePlaylistTracks(userid, listid, uri)
      .then(response => {
        console.dir(response)
        getTracks()
      })
      .catch(error => {
        console.dir(error)
        alert('There was an error deleting that track.  Please try again.')
      })
  }

  $scope.playTrack = function(item) {
    $scope.audio.src = item.track.preview_url
    $scope.audio.play()
  }

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



