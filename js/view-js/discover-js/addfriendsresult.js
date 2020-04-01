mui.plusReady(function() {
	// 获取上一个页面传入的对象，并且对本页面响应的dom赋值初始化
	var currnetWebview = plus.webview.currentWebview()
	var yourFriend = currnetWebview.willBeFriend
	console.log(JSON.stringify(yourFriend))
	
	// 出事化页面数据
	initData(yourFriend)

	// 绑定返回按钮
	var btn_back = document.getElementById("btn_back")
	btn_back.addEventListener("tap", function() {
		mui.back()
	})
	
	// 发送添加好友请求
	bindtapForAdd(yourFriend)
	
	

	
})

function initData(yourFriend){
	var img_friend_face = document.getElementById("img_friend_face");
	var lab_friend_nickname = document.getElementById("lab_friend_nickname");
	var lab_friend_username = document.getElementById("lab_friend_username");
	
	if(app.isNotNull(yourFriend.faceImage)){		
		console.log('friend img is not null:'+yourFriend.faceImage)
		img_friend_face.src = app.imgServerUrl + yourFriend.faceImage;
	}
	lab_friend_nickname.innerHTML = yourFriend.nickname;
	lab_friend_username.innerHTML = yourFriend.username;
}

function bindtapForAdd(yourFriend){
	console.log('tap for send addfriends')
	var meInfo = app.getUserGlobalInfo()
	// 发送添加好友的请求
	var btn_add_friend = document.getElementById("btn_add_friend")
	btn_add_friend.addEventListener("tap", function() {
		console.log('this is add function')
		plus.nativeUI.showWaiting()
		http.request({
			url:"/user/send/friend/reqeust",
			type:"POST",
			data:{
					'userId' : meInfo.id,
					'friendUsername' : yourFriend.username
			},
			success:(data)=>{
				app.showToast("好友请求已发送", "success")
				
				mui.openWindow({
					url: "../index.html",
					id: "index.html"
				})
			}
		})
		// mui.ajax(app.serverUrl + "/user/send/friend/reqeust", {
		// 		data: {
		// 			'userId' : meInfo.id,
		// 			'friendUsername' : yourFriend.username
		// 		},
		// 		dataType: 'json', //服务器返回json格式数据
		// 		type: 'post', //HTTP请求类型
		// 		timeout: 10000, //超时时间设置为10秒；
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		success: function(data) {
		// 			//服务器返回响应
		// 			plus.nativeUI.closeWaiting()
						
					
		// 			if (data.status != 200) {
		// 				app.showToast(data.msg, "error")
		// 				return
		// 			}
					
		// 			app.showToast("好友请求已发送", "success")
					
		// 			mui.openWindow({
		// 				url: "../index.html",
		// 				id: "index.html"
		// 			})
		// 		}
		// 	})
	
	})
}
