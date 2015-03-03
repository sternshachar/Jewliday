angular.module("jewApp")
.filter("amenFilter", function ($filter) {
	return function (items, filterObject,homeFilter) {
		var resultArr = [];
		var noFilterNeeded = true;

		for(var propertyName in filterObject) { //if all filter is false all items go back
			if(filterObject[propertyName] == true){
				noFilterNeeded = false;
				break;
			}
		}

		if(noFilterNeeded){
			resultArr = items;
		} else {
			angular.forEach(items, function (item) {
				var insert = false;
				for(var propertyName in filterObject) {
					if(filterObject[propertyName] == true ){
						if(item.house.amenities[propertyName] == true){
							insert = true
						} else {
							insert = false;
							break;
						}
					}
				}
				if(insert) resultArr.push(item);
			})
		}

		resultArr  = $filter('kosherFilter')(resultArr,homeFilter);
		resultArr  = $filter('synagFilter')(resultArr,homeFilter);
		resultArr  = $filter('bedsFilter')(resultArr,homeFilter);
		resultArr  = $filter('roomsFilter')(resultArr,homeFilter);
		return resultArr;	
	}
})
.filter('kosherFilter',function(){
	return function(items,home){
		var resultArr = [];
		if(!home.kosher){
			resultArr = items;
		} else{
			
			angular.forEach(items, function(item){
				if(item.house.kosher == home.kosher){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})
.filter('synagFilter',function(){
	return function(items,home){
		var resultArr = [];
		if(!home.synagouge){
			resultArr = items;
		} else{
			
			angular.forEach(items, function(item){
				if(item.house.synagouge <= home.synagouge){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})
.filter('bedsFilter',function(){
	return function(items,home){
		var resultArr = [];
		if(!home.beds){
			resultArr = items;
		} else{
			
			angular.forEach(items, function(item){
				if(item.house.beds <= home.beds){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})
.filter('roomsFilter',function(){
	return function(items,home){
		var resultArr = [];
		if(!home.bedrooms){
			resultArr = items;
		} else{
			
			angular.forEach(items, function(item){
				if(item.house.bedrooms <= home.bedrooms){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})







