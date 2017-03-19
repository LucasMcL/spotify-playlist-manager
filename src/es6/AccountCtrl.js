angular.module('AccountCtrl', [])

.controller('AccountCtrl', function($scope, $cordovaOauth, Spotify, Auth) {
  console.log('accounts ctrl instantiated')

  $scope.$on("$ionicView.enter", function() {
    Auth.verify().then(() => {
      console.log('auth has done been checked in the account ctrl')
    })
  })

  $scope.performLogout = function() {
  	console.log('clearing cookies')
  	Spotify.setAuthToken('1234')
    Auth.performLogin()
  }
})
