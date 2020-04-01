mui.plusReady(function() {

	// 获取用户全局对象
	var user = app.getUserGlobalInfo()

	// 加载好友请求
	showFriendRequests()
	
	// 加载聊天快照
	loadChatSnapshot();
	// 添加自定义事件，刷新好友请求，初始化websocket
	window.addEventListener("refresh", function() {
		// CHAT.init()
		loadFriendRequests()
	})
	
	// 为聊天快照列表量绑定点击事件
	mui("#ul_chatSnapshot").on("tap", ".chat-with-friend", function(e) {
		var friendUserId = this.getAttribute("friendUserId");
		var friendNickname = this.getAttribute("friendNickname");
		var friendFaceImage = this.getAttribute("friendFaceImage");

		// 打开聊天子页面
		mui.openWindow({
			url: "chatting.html",
			id: "chatting-" + friendUserId, // 每个朋友的聊天页面都是唯一对应的
			extras: {
				friend:{
					friendUserId: friendUserId,
					friendNickname: friendNickname,
					friendFaceImage: friendFaceImage
				}
			}
		});

		var me = app.getUserGlobalInfo();
		// 标记未读状态为已读
		app.readUserChatSnapshot(me.id, friendUserId);
		// 渲染快照列表进行展示
		loadChatSnapshot();
	});

	// 左滑删除聊天快照和记录
	mui("#ul_chatSnapshot").on("tap", "#link_delChatRecord", function(e) {
		var me = this; // a 标签

		// 获取朋友id
		var friendUserId = me.getAttribute("friendUserId");

		// 1. 删除本地聊天记录
		app.deleteUserChatHistory(user.id, friendUserId);
		// 2. 删除本地聊天快照
		app.deleteUserChatSnapshot(user.id, friendUserId);
		// 3. 移除当前用户操作的dom节点
		var li = me.parentNode.parentNode; // 获取li标签
		var ul_chatSnapshot = document.getElementById("ul_chatSnapshot");
		ul_chatSnapshot.removeChild(li); // 删除li标签
	});

});

function showFriendRequests(){
	var thisWebview = plus.webview.currentWebview();
	thisWebview.addEventListener("show", function() {
		console.log('chatlist show method')
		// console.log('show chatlist')
		loadFriendRequests()
	})
}

// 每次重连后获取服务器的未签收消息
function fetchUnReadMsg() {
	console.log('fetchUnReadMsgs')
	var user = app.getUserGlobalInfo()
	var msgIds = "," // 格式：  ,1001,1002,1003,
	http.request({
		url:"/chat/"+user.id+"/get/unread/msgs",
		success:(data)=>{
			var unReadMsgList = data
			console.log(JSON.stringify(unReadMsgList));
			if(unReadMsgList){
				console.log('un read list is not null')
				// 1. 保存聊天记录到本地
				// 2. 保存聊天快照到本地
				// 3. 对这些未签收的消息，批量签收
				for (var i = 0; i < unReadMsgList.length; i++) {
					var msgObj = unReadMsgList[i]
					// 逐条存入聊天记录
					app.saveUserChatHistory(msgObj.acceptUserId,
											msgObj.sendUserId,
											msgObj.msg, app.msgBelongTo.FRIEND)
					// 存入聊天快照
					app.saveUserChatSnapshot(msgObj.acceptUserId,
											 msgObj.sendUserId,
											 msgObj.msg, false)
					// 拼接批量接受的消息id字符串，逗号间隔
					msgIds += msgObj.id
					msgIds += ","
				}
				
				// 调用批量签收的方法
				CHAT.signMsgList(msgIds)
				// 刷新快照
				loadChatSnapshot()
			}
		}
	})
	// mui.ajax(app.serverUrl + "/chat/"+user.id+"/get/unread/msgs", {
	// 	data: {},
	// 	dataType: 'json', //服务器返回json格式数据
	// 	type: 'get', //HTTP请求类型
	// 	timeout: 10000, //超时时间设置为10秒；
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	success: function(data) {

	// 		if (data.status == 200) {
	// 			var unReadMsgList = data.data
	// 			console.log(JSON.stringify(unReadMsgList));
	// 			if(unReadMsgList){
	// 				console.log('un read list is not null')
	// 				// 1. 保存聊天记录到本地
	// 				// 2. 保存聊天快照到本地
	// 				// 3. 对这些未签收的消息，批量签收
	// 				for (var i = 0; i < unReadMsgList.length; i++) {
	// 					var msgObj = unReadMsgList[i]
	// 					// 逐条存入聊天记录
	// 					app.saveUserChatHistory(msgObj.acceptUserId,
	// 											msgObj.sendUserId,
	// 											msgObj.msg, app.msgBelongTo.FRIEND)
	// 					// 存入聊天快照
	// 					app.saveUserChatSnapshot(msgObj.acceptUserId,
	// 											 msgObj.sendUserId,
	// 											 msgObj.msg, false)
	// 					// 拼接批量接受的消息id字符串，逗号间隔
	// 					msgIds += msgObj.id
	// 					msgIds += ","
	// 				}
					
	// 				// 调用批量签收的方法
	// 				CHAT.signMsgList(msgIds)
	// 				// 刷新快照
	// 				loadChatSnapshot()
	// 			}
				
	// 		}
	// 	}
	// })
}

// 展示聊天快照，渲染列表
function loadChatSnapshot() {
	var user = app.getUserGlobalInfo() // 当前用户信息
	var chatSnapshotList = app.getUserChatSnapshot(user.id); // 缓存的历史聊天快照
	var ul_chatSnapshot = document.getElementById("ul_chatSnapshot"); // 快照展示列表对象
	
	// 清空列表内容，进行重新展示
	ul_chatSnapshot.innerHTML = ""
	
	var chatItemHtml = ""
	for (var i = 0; i < chatSnapshotList.length; i++) {
		var chatItem = chatSnapshotList[i]

		var friendId = chatItem.friendId
		// 根据friendId从本地联系人列表的缓存中拿到相关信息
		var friend = app.getFriendFromContactList(friendId)

		// 判断消息的已读或未读状态
		var isRead = chatItem.isRead
		var isReadClass = ''
		if (!isRead) {
			isReadClass = 'green-point'
		}
		
		chatItemHtml = '<li friendUserId="' + friendId + '" friendNickname="' + friend.friendNickname + '" friendFaceImage="' +
			friend.friendFaceImage + '" class="chat-with-friend mui-table-view-cell mui-media li-container">' +
			'<div class="mui-slider-right mui-disabled">' +
				'<a id="link_delChatRecord" friendUserId="' + friendId + '" class="mui-btn mui-btn-red">删除</a>' +
			'</div>' +
			'<div class="mui-slider-handle mui-media-body ">' +
				'<div class="div-face">'+
				'<img class="mui-media-object mui-pull-left" src="' + app.imgServerUrl + friend.friendFaceImage + '"/>' +
				'</div>'+
				'<div class="div-msg">'+
				'<span class="'+isReadClass+'">'+friend.friendNickname+'</span>'+
				'<p class="mui-ellipsis">' + chatItem.msg + '</p>' +
				'</div>'+
			'</div>' +
			'</li>';
		ul_chatSnapshot.insertAdjacentHTML('beforeend', chatItemHtml)
	}

}

// 加载好友请求记录列表
function loadFriendRequests() {
	// 获取用户全局对象
	var user = app.getUserGlobalInfo()
	http.request({
		url:"/user/" + user.id + "/get/friendrequest/list",
		success:(data)=>{
			var friendRequestList = data
			
			var ul_friend_request_list = document.getElementById("ul_friend_request_list")
			if (friendRequestList == null || friendRequestList.length <= 0) {
				ul_friend_request_list.innerHTML = ""
				return
			}
			var requestHtml = ""
			for (var i = 0; i < friendRequestList.length; i++) {
				requestHtml += renderFriendRequests(friendRequestList[i])
			}
			ul_friend_request_list.innerHTML = requestHtml
			
			// 动态对忽略和通过按钮进行事件绑定
			mui(".btnOper").on("tap", ".ignoreRequest", function(e) {
				var friendId = this.getAttribute("friendId")
				operatorFriendRequest(user.id, friendId, 0)
			})
			
			mui(".btnOper").on("tap", ".passRequest", function(e) {
				var friendId = this.getAttribute("friendId")
				operatorFriendRequest(user.id, friendId, 1)
			})
		}
	})
	// mui.ajax(app.serverUrl + "/user/" + user.id + "/get/friendrequest/list", {
	// 	data: {},
	// 	dataType: 'json', //服务器返回json格式数据
	// 	type: 'get', //HTTP请求类型
	// 	timeout: 10000, //超时时间设置为10秒；
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	success: function(data) {
	// 		//服务器返回响应
	// 		if (data.status == 200) {
	// 			var friendRequestList = data.data

	// 			var ul_friend_request_list = document.getElementById("ul_friend_request_list")
	// 			if (friendRequestList == null || friendRequestList.length <= 0) {
	// 				ul_friend_request_list.innerHTML = ""
	// 				return
	// 			}
	// 			var requestHtml = ""
	// 			for (var i = 0; i < friendRequestList.length; i++) {
	// 				requestHtml += renderFriendRequests(friendRequestList[i])
	// 			}
	// 			ul_friend_request_list.innerHTML = requestHtml
				
	// 			// 动态对忽略和通过按钮进行事件绑定
	// 			mui(".btnOper").on("tap", ".ignoreRequest", function(e) {
	// 				var friendId = this.getAttribute("friendId")
	// 				operatorFriendRequest(user.id, friendId, 0)
	// 			})

	// 			mui(".btnOper").on("tap", ".passRequest", function(e) {
	// 				var friendId = this.getAttribute("friendId")
	// 				operatorFriendRequest(user.id, friendId, 1)
	// 			})
	// 		}
	// 	}
	// })
}

// 操作好友请求
function operatorFriendRequest(userId, friendId, operType) {
	console.log('operator friend reqeust')
	http.request({
		url:"/user/oper/friend/request",
		type:"POST",
		data:{
				'acceptUserId':userId,
				'sendUserId':friendId,
				'operType':operType
		},
		success:(data)=>{
			// 更新通讯录
			var myFriendList = data.data
			app.setContactList(myFriendList)
			
			// 重新加载好友请求记录
			loadFriendRequests()
		}
	})
	// mui.ajax(app.serverUrl + "/user/oper/friend/request", {
	// 		data: {
	// 			'acceptUserId':userId,
	// 			'sendUserId':friendId,
	// 			'operType':operType
	// 		},
	// 		dataType: 'json', //服务器返回json格式数据
	// 		type: 'post', //HTTP请求类型
	// 		timeout: 10000, //超时时间设置为10秒；
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		success: function(data) {
	// 			if(data.status != 200){
	// 				app.showToast(data.msg,'error')
	// 				return
	// 			}
	// 			// 更新通讯录
	// 			var myFriendList = data.data
	// 			app.setContactList(myFriendList)

	// 			// 重新加载好友请求记录
	// 			loadFriendRequests()
	// 		}
	// 	})
}

// 用于拼接单个好友的请求
function renderFriendRequests(friend) {
	console.log("friend:" + JSON.stringify(friend))
	var html = ""
	html = '<li class="btnOper mui-table-view-cell mui-media">' +
		'<a href="javascript:;">' +
		'<img class="mui-media-object mui-pull-left" src="' + app.imgServerUrl + friend.sendFaceImage + '">' +
		'<span id="span_nickname" class="mui-pull-right span-btn">' +
		'<button friendId="' + friend.sendUserId +
		'" type="button" class="ignoreRequest mui-btn mui-btn-grey btn-left" >忽略</button>' +
		'<button friendId="' + friend.sendUserId +
		'" type="button" class="passRequest mui-btn mui-btn-outlined btn-right">同意</button>' +
		'</span>' +
		'<div class="mui-media-body div-text">' +
		'<label>' + friend.sendUsername + '</label>' +
		'<p class="mui-ellipsis">请求添加你为朋友</p>' +
		'</div>' +
		'</a>' +
		'</li>'

	return html
}

