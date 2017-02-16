angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, Spotify) {
  console.log('SearchCtrl instantiated')

  // Spotify.getCurrentUser().then(function (data) {
  //   console.dir(data);
  // })

  $scope.trackResults = ['apple', 'banana']
  $scope.artistResults = ['cucumber', 'durian fruit']

  const SEARCH_BY = 'artist,track'

  $scope.onSubmit = function(query) {
  	// Make spotify api call here
  	// Update $scope.trackResults and $scope.artistResults

  	Spotify
  		 .search(query, SEARCH_BY, {limit: 3})
  		 .then(data => console.dir(data))
  }
})
