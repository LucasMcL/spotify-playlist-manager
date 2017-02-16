angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, Spotify, Playlists, Auth) {
  console.log('SearchCtrl instantiated')

  $scope.userid = ""
  $scope.trackResults = []
  $scope.artistResults = []
  $scope.playlistids = []
  $scope.playlists = []

  // Get current user's playlists upon entering this view
  $scope.$on("$ionicView.enter", function() {
    console.log('getting playlists')
    console.log('verifying auth')
    Auth.verifyToken()
    Playlists.get().then(playlists => $scope.playlists = playlists)
  })

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
