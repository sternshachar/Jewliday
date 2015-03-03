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
		return resultArr;	
	}
})
.filter('kosherFilter',function(){
	return function(items,kosher){
		var resultArr = [];
		if(!kosher.kosher){
			resultArr = items;
		} else{
			
			angular.forEach(items, function(item){
				if(item.house.kosher == kosher.kosher){
					resultArr.push(item);
				}
			})
		}
		return resultArr;
	}
})







