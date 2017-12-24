const portfolioApp = angular.module("portfolioApp", []);

portfolioApp.controller("portfolioController", function($scope, $http, $timeout){


	$scope.albumTitle = "My Albums";
	
	$http.get("/config/albumsJSON.json")
		.then(function(payload){
			var albumsCut = {};
			angular.forEach(payload.data, function(value, key, obj){
				if (key != "profile" && key != "slideshow"){
					albumsCut[key] = value;
				}
			});
			$scope.albums = albumsCut;
		}, function(error){
			console.err(error);
		});

	$scope.albumLength = 0;
	$scope.testFunc = function(ele){

		var albumName = ele.target.innerHTML ? ele.target.innerHTML : false;
		$scope.albumTitle = albumName
		// console.log($scope.albums[albumName].images.length);
		$scope.albumLength = $scope.albums[albumName].images.length;
		$scope.singleAlbum = $scope.albums[albumName].images;
		$scope.singleAlbumView = true;

	}

	$scope.backToAlbums = function (){
		$scope.singleAlbumView = false;
		$scope.albumTitle = "My Albums"
	}


	$scope.viewedImage;
	$scope.viewingIndex;
	$scope.openImage = function(index){
		$scope.viewingIndex = index;
		$scope.modalOpen = true;
		document.getElementById("viewingImage").innerHTML = index+1;

		var thisWidth = $scope.singleAlbum[index].width;
		var thisHeight = $scope.singleAlbum[index].height;
		var divisor = window.outerWidth > 1400 ? 3 : window.outerWidth < 768 ? 5 : 4;
		// console.log(divisor);

		if ( (thisWidth > thisHeight) && (window.outerWidth < 500) ){
			// console.log
			var targetWidth = window.innerWidth; 
			var targetHeight = (thisHeight / thisWidth ) * (thisWidth / divisor);
		} else {
			var targetWidth = thisWidth / divisor; 
			var targetHeight = (thisHeight / thisWidth ) * targetWidth;
		}
		
		var element = document.getElementById("photo-0"+index);
		element.scrollIntoView();
		$scope.viewedImage = element;
		element.classList.remove("albumPhoto-hover");
		element.classList.remove("albumPhoto-transition");
		element.classList.add("albumPhoto-galleryView");
		element.style.width = targetWidth+"px";
		element.style.height = targetHeight+"px";
		element.style.marginTop = "-"+(targetHeight/2)+"px";
		element.style.marginLeft = "-"+(targetWidth/2)+"px";
		document.getElementById("galleryModal").style.display = "block";
		document.getElementById("galleryModalIndicator").style.display = "block";
	}

	$scope.closeImage = function(speed){
		// console.log("Inside closeImg");
		var element = document.getElementById("photo-0"+$scope.viewingIndex);
		element.style.opacity = "0";
		element.classList.remove("albumPhoto-galleryView");
	
		$timeout(function(){
			element.style.marginLeft = "0px";
			element.style.marginTop = "0px";
			element.classList.add("albumPhoto-hover");
			element.style.width = "100%";
			element.style.height = "100%";
			element.style.opacity = "1";
		}, speed)
	}

	$scope.closeModal = function(){
		document.getElementById("galleryModal").style.display = "none";
		document.getElementById("galleryModalIndicator").style.display = "none";
		$scope.modalOpen = false;
		$scope.closeImage(0);
	}

	$scope.changeGalleryImage = function(direction){
		$scope.closeImage(300);
		var nextImage = $scope.viewingIndex == $scope.albumLength-1 ? 0 : $scope.viewingIndex+1;
		var prevImage = $scope.viewingIndex == 0 ? $scope.albumLength-1 : $scope.viewingIndex-1;
		if (direction == "right"){
			$scope.openImage(nextImage);
		} else if (direction == "left"){
			$scope.openImage(prevImage);
		} else {
			$scope.closeModal();
		}
		
		
	}

	$scope.keyboardListener = function(){
		window.onkeyup = function(event){
			if ($scope.modalOpen){
				switch(event.which){
					case 37:   //left arrow
						$scope.changeGalleryImage("left");
						break;
					case 39:   // right arrow
						$scope.changeGalleryImage("right");
						break;
					case 27: //Escape button
						$scope.closeModal();
						break;
					default:
						event.preventDefault();
				}
			}
	    }
	}
	$scope.keyboardListener();


});

portfolioApp.directive("albumPhoto", function(){
	return {
		restrict: "EA",
		template: "<img id=\"photo-0{{$index}}\" class=\"albumPhoto-image albumPhoto-hover galleryImage albumPhoto-transition\" src=\"{{y.path}}\" alt=\"{{y.path}}\" ng-click=\"openImage($index)\">",
		link: function($scope, $element, $attr){
			var theIMG = $element[0].querySelectorAll("img")[0];
			// console.log($element[0].querySelectorAll("img"));
			if($scope.$last){
				var theImgs = document.getElementsByClassName("albumPhoto-image");
				angular.forEach(theImgs, function(ele, key, obj){
					setTimeout(function(){
						ele.style.width="100%";
						ele.style.height="100%";
					}, 300);
				});
			}

			sharedFunctions.swipedetect(theIMG, function(swipedir){
				if (swipedir == "right"){
					$scope.changeGalleryImage("left");
				} else if (swipedir == "left"){
					$scope.changeGalleryImage("right");
				}
			});
		}
	}
});

portfolioApp.directive("galleryModal", function(){
	return{
		restrict: 'AE', 
		templateUrl: "/pages/shared/galleryModal.html"
	}
});

portfolioApp.directive("testDir", function(){
	return{
		template: "<div style=\"width:100%;\"><h3>Hello</h3></div>"
	}
});

