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

  $scope.logCurrentUser = function() {
    Auth.getCurrentUser()
      .then(user => console.log(user))
      .catch(err => console.error(err))
  }

  $scope.setExpiredAuthToken = function() {
    window.localStorage.setItem('spotify-token', 'BQD16PKK6SKI-FeBM-3dyI7lMt-FlWXO0nEVJByEumSclYJyKHLVWduj98LmAIy8hzmGDKCNHxFnyGNGfJG7GCTKb_ebIv3jlwdChjVcMH472ZFiUJ3acdwsfjloeVQC9wn7CKPwx5LUyEuH-oP_2zKND0xSKa1J4W4NdF_FgvTMjTnVkY_g6g')
    Spotify.setAuthToken("BQD16PKK6SKI-FeBM-3dyI7lMt-FlWXO0nEVJByEumSclYJyKHLVWduj98LmAIy8hzmGDKCNHxFnyGNGfJG7GCTKb_ebIv3jlwdChjVcMH472ZFiUJ3acdwsfjloeVQC9wn7CKPwx5LUyEuH-oP_2zKND0xSKa1J4W4NdF_FgvTMjTnVkY_g6g")
  }

  $scope.i = 0
  $scope.setTimer = function() {
    window.setTimeout(() => {
      console.log(`${$scope.i}: Timer executed`)
    }, 5000)
    $scope.i++
  }
})
