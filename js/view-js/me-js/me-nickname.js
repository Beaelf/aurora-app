mui.plusReady(function() {
	var user = app.getUserGlobalInfo()

	// 初始化输入框值
	var txt_nickname = document.getElementById("txt_nickname")
	var mynickname = user.nickname
	txt_nickname.value = mynickname

	// 提交事件，修改昵称
	bindtapForSubmit(user,txt_nickname)

})

function bindtapForSubmit(user,txt_nickname){
	var link_submit_nickname = document.getElementById("link_submit_nickname")
	link_submit_nickname.addEventListener("tap", function() {
		
		// 校验输入的昵称
		var newNickname = txt_nickname.value
		var isPass = validateNickname(newNickname)
		if(!isPass){
			return
		}
	
		plus.nativeUI.showWaiting()
		http.request({
			url:'/user/update/nickname',
			type:'POST',
			data:{
				userId: user.id,
				nickname: newNickname
			},
			success:(data)=>{
				// 刷新缓存的user对象
				app.setUserGlobalInfo(data)
				
				// 触发另外一个webview的自定义事件，可以使用 mui.fire()
				var meWebview = plus.webview.getWebviewById("me.html");
				mui.fire(meWebview, "refresh")
				
				// 页面跳转
				mui.back()
			}
		})
	// 	mui.ajax(app.serverUrl + "/user/update/nickname", {
	// 		data: {
	// 			userId: user.id,
	// 			nickname: newNickname
	// 		},
	// 		dataType: 'json', //服务器返回json格式数据
	// 		type: 'post', //HTTP请求类型
	// 		timeout: 10000, //超时时间设置为10秒；
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		success: function(data) {
	// 			//服务器返回响应，根据响应结果，分析是否登录成功；
	// 			plus.nativeUI.closeWaiting()
	
	// 			if (data.status != 200) {
	// 				app.showToast(data.msg, "error")
	// 			}
				
	// 			// 登录或者注册成功之后，保存全局用户对象到本地缓存
	// 			var user = data.data
	// 			app.setUserGlobalInfo(user)
				
	// 			// 触发另外一个webview的自定义事件，可以使用 mui.fire()
	// 			var meWebview = plus.webview.getWebviewById("me.html");
	// 			mui.fire(meWebview, "refresh")
				
	// 			// 页面跳转
	// 			mui.back()
	// 		},
	// 		error: function(xhr, type, errorThrown) {
	// 			plus.nativeUI.closeWaiting()
	// 			//异常处理；
	// 			console.log(type)
	// 		}
	// 	})
	})
}

function validateNickname(newNickname){
	if(!newNickname){
		app.showToast("昵称不能为空", "error")
		return false
	}
	if(newNickname.indexOf(' ') != -1){
		app.showToast("不能含有空格", "error")
		return false
	}
	
	if (newNickname.length < 1) {
		app.showToast("昵称长度太短", "error")
		return false
	}
	if (newNickname.length > 8) {
		app.showToast("昵称不能超过8位", "error")
		return false
	}
	return true
}
