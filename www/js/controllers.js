angular.module('controllers', [])

.controller('PlaylistsCtrl', function($scope, $ionicPlatform, $cordovaOauth, Spotify) {
  console.log('playlist control instantiated')

  let CLIENT_ID = 'd3fe3362f8634a1b82b89ab344238891'
  let SCOPE = ['user-read-private', 'playlist-read-private']

  $scope.playlists = []

  $ionicPlatform.ready(function() {
    let storedToken = window.localStorage.getItem('spotify-token')
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
      console.log("result of performLogin", result)
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

.controller('PlaylistDetailCtrl', function($scope) {
  console.log('playlist detail control instantiated')

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

.controller('AccountCtrl', function($scope) {
  console.log('accounts ctrl instantiated')

  $scope.settings = {
    enableFriends: true
  };
})



