mui.plusReady(function() {
	
	// 获得当前的webview，刷新当前用户信息
	var meWebview = plus.webview.currentWebview()
	meWebview.addEventListener("show", function() {
		loadUserInfo()
	})
	
	
	// 添加自定义事件，刷新头像
	window.addEventListener("refresh", function() {
		console.log('me refresh event')
		loadUserInfo()
	})

	// 页面跳转，我的头像
	var link_face = document.getElementById("link_face")
	link_face.addEventListener("tap", function() {
		console.log('face add listen')
		mui.openWindow("me-face.html", "me-face.html")
	})

	// 页面跳转，修改昵称
	var link_nickname = document.getElementById("link_nickname")
	link_nickname.addEventListener("tap", function() {
		mui.openWindow({
			url:"me-nickname.html",
			id:"me-nickname.html"
		})
	})

	// 查看我的二维码
	var link_qrcode = document.getElementById("link_qrcode");
	link_qrcode.addEventListener("tap", function() {
		mui.openWindow({
			url: "me-qrcode.html",
			id: "me-qrcode.html",
			styles: {}
		})
	})

	// 用户退出
	var link_logout = document.getElementById("link_logout");
	link_logout.addEventListener("tap", function() {
		var oldUser = app.getUserGlobalInfo()
		app.userLogout()
		mui.openWindow({
			url:"../login.html",
			id:"login.html"
		} )
		
		if(app.isNotNull(oldUser)){
			console.log('logout refresh')
			var loginWebview = plus.webview.getWebviewById('login.html')
			mui.fire(loginWebview,'refresh',{
				user:oldUser
			})
		}
	})
})

function loadUserInfo() {
	var user = app.getUserGlobalInfo()
	// console.log(JSON.stringify(user))

	if (!user) {
		return
	}
	
	var faceImage = user.faceImage
	var nickname = user.nickname
	var username = user.username
	
	var span_nickname = document.getElementById("span_nickname")
	var span_username = document.getElementById("span_username")
	
	span_nickname.innerHTML = nickname
	span_username.innerHTML = username
	
	if (app.isNotNull(faceImage)) {
		// console.log('faceimg is not null'+faceImage)
		var img_face = document.getElementById("img_face")
		img_face.src = app.imgServerUrl + faceImage
	}

}
