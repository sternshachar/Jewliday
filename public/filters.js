angular.module("jewApp")
.filter("amenFilter", function () {
	return function (items, filterObject) {
		var resultArr = [];
		var noFilterNeeded = true;

		for(var propertyName in filterObject) { //if all filter is false all items go back
			if(filterObject[propertyName] == true)
				noFilterNeeded = false;
				break;
		}

		if(noFilterNeeded){
			return items;
		}

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

			   // propertyName is what you want
			   // you can get the value like this: myObject[propertyName]
			}
		if(insert) resultArr.push(item);
		}
		return resultArr;
	});
});

			// if (item.done == false || showComplete == true) {
			// resultArr.push(item);
			// }