angular.module("jewApp")
.filter("fire", function () {
	return function (items) {
		var resultArr = [];
		angular.forEach(items, function (item) {
			if (item.done == false || showComplete == true) {
			resultArr.push(item);
			}
		});
		return resultArr;
	}
});