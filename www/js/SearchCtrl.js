angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, Spotify) {
  console.log('SearchCtrl instantiated')


  $scope.userid = ""
  $scope.trackResults = []
  $scope.artistResults = []

  Spotify.getCurrentUser().then(function (data) {
    $scope.userid = data.id
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
