angular.module('PlaylistsCtrl', [])

.controller('PlaylistsCtrl', function($scope, $ionicPlatform, $cordovaOauth, Spotify, Auth, Playlists) {
  console.log('playlist control instantiated')

  $scope.playlists = []
  let userid

  // Checks for auth on entering this view
  // After that, loads in playlists for that user
  $scope.$on("$ionicView.enter", function() {
    Auth.verify().then(() => {
      console.log('auth has done been checked in the playlist ctrl')
      Spotify.getCurrentUser()
        .then(user => {
          userid = user.id
          Playlists.get().then(playlists => {
            function isOwnedByUser(playlist) {
              return playlist.owner.id === userid
            }
            $scope.playlists = playlists.filter(isOwnedByUser)
          })
        })
    })
  })


})
