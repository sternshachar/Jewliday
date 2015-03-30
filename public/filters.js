angular.module("jewApp")
.filter("amenFilter", function ($filter,$rootScope) {
	return function (items, filterObject,homeFilter) {
		var filters = {TV: false, wifi: false, AirCondition: false,Dryer: false,
				Elevator: false, Essentials: false, FreeParking: false,Heating: false,
				Fireplace: false, PetsAllowed: false, Pool: false,SmokingAllowed: false,
				Washer: false, Accessibility: false}
		var resultArr = [];
		var noFilterNeeded = true;
		if(!items){
			return items;
		}
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

		$rootScope.$broadcast('filterExec',resultArr.length);
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
				if(item.house.beds >= home.beds){
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
				if(item.house.bedrooms >= home.bedrooms){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})
.filter('searchPagination',function(){
	return function(items,step,pageNum){
		if(!items){
			return items;
		} else{
			var resultArr = [];

			resultArr = items.slice((pageNum - 1)*step,pageNum*step);
			// console.log(resultArr);
			return resultArr;
		}
	}
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});





