angular.module('SearchCtrl', [])

.controller('SearchCtrl', function($scope, Spotify) {
  console.log('SearchCtrl instantiated')

  Spotify.getCurrentUser().then(function (data) {
    console.dir(data);
  });
})
