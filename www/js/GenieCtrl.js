angular.module('GenieCtrl', [])

.controller('AccountCtrl', function($scope, $cordovaOauth, Spotify) {
  console.log('accounts ctrl instantiated')

  $scope.settings = {
    enableFriends: true
  };

})
