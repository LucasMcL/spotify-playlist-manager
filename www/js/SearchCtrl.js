angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, Spotify, Playlists) {
  console.log('SearchCtrl instantiated')

  $scope.userid = ""
  $scope.trackResults = []
  $scope.artistResults = []
  $scope.playlistids = []

  // Get current user every time the user navigates to this view
  $scope.$on("$ionicView.enter", function() {
    $scope.updateInfo()
  })

  $scope.$on("$ionicView.enter", function() {
    console.log('getting playlists')
    Playlists.get('testuserspotifyapp').then(response => {console.dir(response)})
  })

  // This function copied from PlaylistsCtrl.js
  // Abstract to factory maybe?
  $scope.updateInfo = function() {
    console.log('updating info')
    Spotify.getCurrentUser().then(function (data) {
      $scope.userid = data.id
      $scope.getUserPlaylists(data.id)
    }).catch(function(error) {
      console.dir(error)
    })
  }

  // This function copied from PlaylistsCtrl.js
  // Abstract to factory maybe?
  $scope.getUserPlaylists = function(userid) {
    console.log('getting playlist ids')
    Spotify.getUserPlaylists(userid).then(function (data) {
      $scope.playlistids = []
      data.items.forEach(item => $scope.playlistids.push(item.id))
    }).catch(function(error) {
      console.dir(error)
    })
  }

  const SEARCH_BY = 'artist,track'

  $scope.onSubmit = function(query) {

  	Spotify
  		 .search(query, SEARCH_BY, {limit: 5})
  		 .then(data => {
  		 		$scope.trackResults = data.tracks.items
  		 		$scope.artistResults = data.artists.items
  		 })
  }

})

.controller('ArtistDetailCtrl', function($scope, Spotify, $stateParams) {
  $scope.artistid = $stateParams.artistid
  $scope.artistName = $stateParams.artistName
  $scope.userid = $stateParams.userid


})
