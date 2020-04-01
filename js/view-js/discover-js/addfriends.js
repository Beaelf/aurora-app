mui.plusReady(function() {

	

	// 提交事件，搜索朋友
	var link_submit_search = document.getElementById("link_submit_search")
	link_submit_search.addEventListener("tap", function() {

		var user = app.getUserGlobalInfo()
		var txt_your_friend_username = document.getElementById("txt_your_friend_username")
		var yourFriendUsername = txt_your_friend_username.value
		if(!app.isNotNull(yourFriendUsername)){
			app.showToast("输入内容不能为空","error")
			return
		}
		console.log('add friend tap, current user:' + JSON.stringify(user))
		plus.nativeUI.showWaiting()
		http.request({
			url:"/user/" + user.id + "/search/friend/" + yourFriendUsername,
			success:(data)=>{
				mui.openWindow({
					url: "addfriendsresult.html",
					id: "addfriendsreasult.html",
					extras: {
						willBeFriend: data
					}
				})
			}
		})
		// mui.ajax(app.serverUrl + "/user/" + user.id + "/search/friend/" + yourFriendUsername, {
		// 	data: {},
		// 	dataType: 'json', //服务器返回json格式数据
		// 	type: 'get', //HTTP请求类型
		// 	timeout: 10000, //超时时间设置为10秒；
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	success: function(data, textStatus, xhr) {
		// 		// console.log("textStatus"+textStatus)
		// 		// console.log("xhr"+xhr.readyState +"-" +xhr.status)
		// 		//服务器返回响应
		// 		plus.nativeUI.closeWaiting()

		// 		if (data.status != 200) {
		// 			app.showToast(data.msg, "error")
		// 			return
		// 		}

		// 		mui.openWindow({
		// 			url: "addfriendsresult.html",
		// 			id: "addfriendsreasult.html",
		// 			extras: {
		// 				willBeFriend: data.data
		// 			}
		// 		})
		// 	},
		// 	error: function(xhr) {
		// 		plus.nativeUI.closeWaiting()
		// 		console.log('error xhr ' + xhr.status);
		// 		// console.log('error type'+type)
		// 	}
		// })
	})

})
