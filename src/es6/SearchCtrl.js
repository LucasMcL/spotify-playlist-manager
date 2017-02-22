angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, $ionicPopover, Spotify, Playlists, Auth) {
  console.log('SearchCtrl instantiated')

  $scope.userid = ""
  $scope.trackResults = []
  $scope.artistResults = []
  $scope.playlists = []

  // Perform auth check on view enter
  // Load in playlists after that resolves
  $scope.$on("$ionicView.enter", function() {
    Auth.verify().then(() => {
      console.log('Auth has done been checked in the search ctrl')
      Playlists.get().then(playlists => $scope.playlists = playlists)
    })
  })

  $ionicPopover.fromTemplateUrl('add-to-playlist.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.onAddButtonClick = function($event, name) {
    $scope.popover.show($event)
  };

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
