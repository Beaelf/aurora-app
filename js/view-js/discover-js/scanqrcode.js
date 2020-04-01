mui.plusReady(function() {
	setTimeout("startScan()", "1000");
});

var scan
function startScan() {
	// 二维码样式
	var styles = {
		frameColor: "#51874c",
		scanbarColor: "#51874c",
		background: ""
	}
	
	// 创建
	scan = new plus.barcode.Barcode('scanComponent', null, styles)
	// 成功回调函数
	scan.onmarked = onmarked
	// 启动
	scan.start()
}

/**
 * @param {Object} type 识别到的条码类型，二维码为0
 * @param {Object} result 识别到的条码数据
 */
function onmarked(type, result) {

	// 判断是否为QR二维码类型
	if (type != 0) {
		return
	}

	// 识别到的条码数据
	var content = result.split("mgchat_qrcode:");
	if (content.length != 2) {
		// 没有数据
		mui.alert(result)
		return
	}

	// 条码数据中的用户名
	var friendUsername = content[1]
	
	// 发送好友请求
	searchfriendrequest(friendUsername)	
	
	// // 请求发送后，重新启动扫码
	// scan.start()
}

function searchfriendrequest(friendUsername){
	var user = app.getUserGlobalInfo();
	plus.nativeUI.showWaiting();
	http.request({
		url:"/user/" + user.id + "/search/friend/" + friendUsername,
		success:(data)=>{
			mui.openWindow({
				url: "addfriendsresult.html",
				id: "addfriendsresult.html",
				extras: {
					willBeFriend: data
				}
			})
		}
	})
	// mui.ajax(app.serverUrl + "/user/" + user.id + "/search/friend/" + friendUsername, {
	// 	data: {},
	// 	dataType: 'json', //服务器返回json格式数据
	// 	type: 'GET', //HTTP请求类型
	// 	timeout: 10000, //超时时间设置为10秒；
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	success: function(data) {
	// 		//服务器返回响应
	// 		plus.nativeUI.closeWaiting();
	
	// 		if (data.status != 200) {
	// 			app.showToast(data.msg, "error");
	// 			return
	// 		}
	// 		mui.openWindow({
	// 			url: "addfriendsresult.html",
	// 			id: "addfriendsresult.html",
	// 			extras: {
	// 				willBeFriend: data.data
	// 			}
	// 		})
	// 	},
	// 	error(xhr){
	// 		plus.nativeUI.closeWaiting();
	// 		console.log('error xhr:'+xhr.readyState)
	// 	}
	// })
}
