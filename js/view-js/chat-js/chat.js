// 构建聊天业务CHAT
window.CHAT = {
	socket: null,
	init: function() {
		if (window.WebSocket) {

			// 如果当前的状态已经连接，那就不需要重复初始化websocket
			if (CHAT.socket != null &&
				CHAT.socket != undefined &&
				CHAT.socket.readyState == WebSocket.OPEN) {
				return false
			}

			CHAT.socket = new WebSocket(app.nettyServerUrl)
			CHAT.socket.onopen = CHAT.wsopen
				CHAT.socket.onclose = CHAT.wsclose
				CHAT.socket.onerror = CHAT.wserror
				CHAT.socket.onmessage = CHAT.wsmessage
		} else {
			alert("手机设备过旧，请升级手机设备...")
		}
	},
	chat: function(msg) {

		// 如果当前websocket的状态是已打开，则直接发送， 否则重连
		if (CHAT.socket != null &&
			CHAT.socket != undefined &&
			CHAT.socket.readyState == WebSocket.OPEN) {
			CHAT.socket.send(msg)
		} else {
			// 重连websocket
			CHAT.init();
			setTimeout("CHAT.reChat('" + msg + "')", "1000")
		}
		// 渲染快照列表进行展示
		var chatlistWebview = plus.webview.getWebviewById('chatlist.html')
		chatlistWebview.evalJS("loadChatSnapshot()")
	},
	reChat: function(msg) {
		console.log("消息重新发送...")
		CHAT.socket.send(msg)
	},
	wsopen: function() {
		console.log("websocket连接已建立...")

		var me = app.getUserGlobalInfo()
		// 构建ChatMsg
		var chatMsg = new app.ChatMsg(me.id, null, null, null);
		// 构建DataContent
		var dataContent = new app.DataContent(app.msgAction.CONNECT, chatMsg, null)
		// 发送websocket
		CHAT.chat(JSON.stringify(dataContent))

		// 每次连接之后，获取用户的未读未签收消息列表
		var chatlistWebview = plus.webview.getWebviewById('chatlist.html')
		chatlistWebview.evalJS("fetchUnReadMsg()")

		// 定时发送心跳
		// setInterval("CHAT.keepalive()", 10000)
	},
	wsmessage: function(e) {
		console.log("接受到消息：" + e.data)
		
		var chatlistWebview = plus.webview.getWebviewById('chatlist.html')

		// 转换DataContent为对象
		var dataContent = JSON.parse(e.data)
		var action = dataContent.action
		console.log('action:'+action)
		if (action === app.PULL_FRIEND) {
			chatlistWebview.evalJS("fetchContactList()")
			return
		}

		// // 如果不是重新拉取好友列表，则获取聊天消息模型，渲染接收到的聊天记录
		var chatMsg = dataContent.chatMsg
		var msg = chatMsg.msg
		var friendUserId = chatMsg.senderId
		var myId = chatMsg.receiverId

		// // 调用聊天webview的receiveMsg方法
		var chatWebview = plus.webview.getWebviewById("chatting-" + friendUserId)
		var isRead = false // 设置消息的默认状态为未读
		if (chatWebview != null) {
			isRead = true // chatwebview不为空，改为已读
			chatWebview.evalJS("receiveMsg(friend,'" + msg + "')")
			chatWebview.evalJS("resizeScreen()")
		} 

		// 接受到消息之后，对消息记录进行签收
		var dataContentSign = new app.DataContent(app.msgAction.SIGNED, null, chatMsg.msgId)
		CHAT.chat(JSON.stringify(dataContentSign))

		// 保存聊天历史记录到本缓存
		app.saveUserChatHistory(myId, friendUserId, msg, app.msgBelongTo.FRIEND)
		app.saveUserChatSnapshot(myId, friendUserId, msg, isRead)
		// 渲染快照列表进行展示
		chatlistWebview.evalJS("loadChatSnapshot()")
	},
	wsclose: function() {
		console.log("连接关闭...")
	},
	wserror: function() {
		console.log("发生错误...")
	},
	signMsgList: function(unSignedMsgIds) {
		console.log('un sign msgs'+unSignedMsgIds)
		// 构建批量签收对象的模型
		var dataContentSign = new app.DataContent(app.msgAction.SIGNED,null,unSignedMsgIds)
		// 发送批量签收的请求
		CHAT.chat(JSON.stringify(dataContentSign))
	},
	keepalive: function() {
		console.log('keepalive')
		// 构建对象
		var dataContent = new app.DataContent(app.KEEPALIVE, null, null)
		// 发送心跳
		CHAT.chat(JSON.stringify(dataContent))

		// 定时执行函数
		var chatlistWebview = plus.webview.getWebviewById('chatlist.html')
		chatlistWebview.evalJS("fetchUnReadMsg()") // 收取未读消息
		var contactWebview = plus.webview.getWebviewById('contact.html')
		contactWebview.evalJS("fetchContactList()") // 获取联系人列表
	}
}
