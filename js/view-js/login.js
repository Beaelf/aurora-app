mui.plusReady(function() {
	// 禁止返回到主页面
	mui.back = function() {
		return false
	}

	// 设置标题
	var oTitle = document.getElementById('title')
	oTitle.innerHTML=app.appName
	
	// 初始化头像
	window.addEventListener('refresh', function(event){
		console.log('login event')
		refreshData(event.detail.user)
	})
	
	var user = app.getUserGlobalInfo()

	// 判断用户是否注册登录过，如果本地内存有全局的用户对象，此时直接跳转到首页
	skipLogin(user)
	
	// 绑定登录提交事件
	bindtapForLogin()
})

function refreshData(user){
	var faceImage = user.faceImage
	if(app.isNotNull(faceImage)){
		var img_login_face = document.getElementById('img_login_face')
		img_login_face.src=app.imgServerUrl+faceImage
	}
	
	var txt_username = document.getElementById("txt_username")
	txt_username.value = user.username
	
}

function skipLogin(user) {
	if (user != null) {
		// 页面跳转
		mui.openWindow("index.html", "index.html")
	}
}

function bindtapForLogin() {
	var userform = document.getElementById("userform")
	var username = document.getElementById("txt_username")
	var password = document.getElementById("txt_password")

	userform.addEventListener("submit", function(e) {
		// 判断用户名是否为空，如果为空则让其获得焦点
		var isPass=validateUsernamePassword(username,password)
		if(!isPass){
			return
		}
		// 获取每台手机的唯一cid
		var cid = plus.push.getClientInfo().clientid
		
		plus.nativeUI.showWaiting()
		// 与后端联调
		// mui.ajax(app.serverUrl + "/user/registerOrLogin", {
		// 	data: {
		// 		username: username.value,
		// 		password: password.value,
		// 		cid: cid
		// 	},
		// 	dataType: 'json', //服务器返回json格式数据
		// 	type: 'post', //HTTP请求类型
		// 	timeout: 10000, //超时时间设置为10秒；
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	success: function(data) {
		// 		plus.nativeUI.closeWaiting()
		// 		username.blur()
		// 		password.blur()
				
		// 		if (!data.status == 200) {
		// 			app.showToast(data.msg, "error")
		// 			return
		// 		}
				
		// 		// 登录或者注册成功之后，保存全局用户对象到本地缓存
		// 		var user = data.data
		// 		app.setUserGlobalInfo(user)
				
		// 		// 页面跳转
		// 		mui.openWindow("index.html", "index.html")
		// 	},
		// 	error:function(xhr,type,errorThrown){
		// 		plus.nativeUI.closeWaiting()
		// 		//异常处理；
		// 		console.log(type);
		// 	}
		// })
		
		http.request({
			url:'/user/registerOrLogin',
			type: 'POST',
			data: {
				username: username.value,
				password: password.value,
				cid: cid
			},
			success:(data)=>{
				// 让文本输入框失去焦点
				username.blur()
				password.blur()
				
				// 登录或者注册成功之后，保存全局用户对象到本地缓存
				app.setUserGlobalInfo(data)
				
				// 页面跳转
				mui.openWindow("index.html", "index.html")
			}
		})


		// 阻止默认时间，阻止默认表单提交
		e.preventDefault()
	})
}

function validateUsernamePassword(username,password){
	if (!app.isNotNull(username.value)) {
		app.showToast("用户名不能为空", 'error')
		// 获取焦点
		username.focus()
		return false
	}
	if (!app.isNotNull(password.value)) {
		app.showToast("密码不能为空", 'error')
		// 获取焦点
		txt_password.focus()
		return false
	}
	
	// 用户名和密码不能含有空格
	if(username.value.indexOf(' ') != -1 || password.value.indexOf(' ') != -1){
		app.showToast("用户名/面不能含有空格", 'error')
		return false
	}
	
	// 判断用户名和密码的长度，进行限制
	if (username.value.length > 12) {
		app.showToast("用户名不能超过12", "error")
		return false
	} else if (password.value.length > 12) {
		app.showToast("密码不能超过12", "error")
		return false
	}
	
	return true
}