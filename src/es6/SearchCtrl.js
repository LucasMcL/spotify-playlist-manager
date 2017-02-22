angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, $ionicPopover, $cordovaToast, Spotify, Playlists, Auth) {
  console.log('SearchCtrl instantiated')

  let userid = ""
  let trackUri = ""
  $scope.trackResults = []
  $scope.artistResults = []
  $scope.playlists = []

  // Perform auth check on view enter
  // Load in playlists after that resolves
  $scope.$on("$ionicView.enter", function() {
    Auth.verify().then(() => {
      console.log('Auth has done been checked in the search ctrl')
      Playlists.get().then(playlists => $scope.playlists = playlists)
      Auth.getCurrentUser().then(id => userid = id)
    })
  })

  $ionicPopover.fromTemplateUrl('add-to-playlist.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.onAddButtonClick = function($event, uri) {
    $scope.popover.show($event)
    trackUri = uri
  }

  $scope.onPlaylistClick = function(playlist) {
    let playlistid = playlist.id
    let playlistName = playlist.name
    $scope.popover.hide()
    Spotify.addPlaylistTracks(userid, playlistid, trackUri)
      .then(() => showSongAddedToast(playlistName))
      .catch(error => alert(error))
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

  function showSongAddedToast(playlistName) {
    $cordovaToast.showWithOptions({
      message: `Song added to ${playlistName}`,
      duration: "short",
      position: "bottom",
      addPixelsY: -175  // move up above tabs
    }).catch(error => {
      console.log(error)
    })
  }
})

.controller('ArtistDetailCtrl', function($scope, Spotify, $stateParams) {
  $scope.artistid = $stateParams.artistid
  $scope.artistName = $stateParams.artistName
  $scope.userid = $stateParams.userid
})
