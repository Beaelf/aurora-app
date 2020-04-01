mui.plusReady(function() {
	var li_moment = document.getElementById("li_moment")
	li_moment.addEventListener('tap',function(){
		console.log('this is moment tap event')
		mui.openWindow("../moment/moment.html","moment.html")
	})

	var li_add_friends = document.getElementById("li_add_friends")
	li_add_friends.addEventListener("tap", function() {
		mui.openWindow("addfriends.html", "addfriends.html")
	})

	var li_scanme = document.getElementById("li_scanme")
	li_scanme.addEventListener("tap", function() {
		mui.openWindow("scanqrcode.html", "scanqrcode.html")
	});

});
