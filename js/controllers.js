'use strict';

var controllers = angular.module('controllers', []);

controllers.controller('UploadController',['$scope', function($scope) {
  $scope.sizeLimit      = 500*1058576; // 500MB in Bytes
  $scope.uploadProgress = 0;
  $scope.creds          = {};
  $scope.files          = [];

  $scope.upload = function(){
    AWS.config.update({ accessKeyId: 'YOUR_ACCESS_KEY_ID', secretAccessKey: 'YOUR_ACCESS_SECRET' });
    AWS.config.region = 'us-east-1';
    var bucket = new AWS.S3({ params: { Bucket: 'YOUR_BUCKET' } });

    if ($scope.files.length > 0) {
      for (var i=0; i < $scope.files.length; i++) {
        var file = $scope.files[i];
        console.log(file._file)
        $scope.uploadProgress = 0;

        // Perform File Size Check First
        var fileSize = Math.round(parseInt(file.size));
        if (fileSize > $scope.sizeLimit) {
          toastr.error('You have 1 or more attachments that are too large. <br/> Maximum '  + $scope.fileSizeLabel() + ' file attachment allowed','File Too Large');
          return false;
        }
        // Prepend Unique String To Prevent Overwrites
        var uniqueFileName = $scope.uniqueString() + '-' + file.name;

        var params = { Key: uniqueFileName, ContentType: file.type, Body: file._file, ServerSideEncryption: 'AES256' };

        bucket.putObject(params, function(err, data) {
          if(err) {
            toastr.error(err.message,err.code);
            return false;
          }
          else {
            // Upload Successfully Finished
            toastr.success('File '+file.name+' Uploaded Successfully', 'Done');

            // Reset The Progress Bar
            setTimeout(function() {
              $scope.uploadProgress = 0;
              $scope.$digest();
            }, 4000);
          }
        })
        .on('httpUploadProgress',function(progress) {
          $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
          $scope.$digest();
        });
      }
    }
    else {
      toastr.error('No files selected');
    }

  };


  $scope.fileSizeLabel = function() {
    // Convert Bytes To MB
    return Math.round($scope.sizeLimit / 1024 / 1024) + 'MB';
  };

  $scope.uniqueString = function() {
    var text     = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}]);
