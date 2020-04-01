var friend
mui.plusReady(function() {
	
	// 获取聊天页面webview
	var chattingWebview = plus.webview.currentWebview();
	// 获取上一个页面传入的好友属性值
	friend = chattingWebview.friend
	console.log(JSON.stringify(friend))
	
	// 设置聊天页面的软键盘样式
	chattingWebview.setStyle({
		softinputMode: "adjustResize"
	});

	var friendUserId = friend.friendUserId;
	// 初始化聊天页面数据
	initData(friend);
	// 初始化聊天屏幕设置，滚动到最一天消息
	initScreen()
	
	// 发送消息按钮的事件绑定
	bindtapForSendMsg(friend)
});

function initData(friend){
	var friendNickname = friend.friendNickname;
	// 标题改为朋友的昵称
	document.getElementById("chatting-nickname").innerHTML = friendNickname;
	
	// 渲染初始化的聊天记录
	initChatHistory();
}

function initScreen(){
	// 设置聊天记录进入页面的时候自动滚动到最后一条
	resizeScreen()
	// 对当前的窗口监听resize事件，弹出输入键盘时会触发
	window.addEventListener("resize", function() {
		resizeScreen();
		document.getElementById("msg-outter").style.paddingBottom = "50px"
	})
}


// 初始化用户的聊天记录
function initChatHistory() {
	var msg_list = document.getElementById("msg")
	
	var me = app.getUserGlobalInfo()
	var myId = me.id
	var myFaceImg = me.faceImage
	
	var friendUserId = friend.friendUserId
	var friendFaceImage = friend.friendFaceImage

	var chatHistoryList = app.getUserChatHistory(myId, friendUserId)

	var togetherHTML = ""

	for (var i = 0; i < chatHistoryList.length; i++) {
		var singleMsg = chatHistoryList[i]
		if (app.msgBelongTo.ME==singleMsg.flag) {
			togetherHTML += makeMsgHtml('me_lists','left','msg-right-green',myFaceImg,singleMsg.msg)
			
		} else {
			togetherHTML += makeMsgHtml('friend_lists','right','msg-left-white',friendFaceImage,singleMsg.msg)
		}
	}
	msg_list.innerHTML = togetherHTML
}

function makeMsgHtml(msgStyle,direction,msgColor,faceImage,msg){
	return '<div class="'+msgStyle+'">' +
				'<div class="header_img">' +
				'<img src="' + app.imgServerUrl + faceImage + '" width="40px" height="40px" />' +
				'</div>' +
				'<div class="msg-wrapper '+direction+'">' +
				'<p class="'+msgColor+'">' + msg + '</p>' +
				'</div>' +
				'</div>'
}

// 重新调整聊天窗口
function resizeScreen() {
	var areaMsgList = document.getElementById("msg");
	// 设置聊天记录进入页面的时候自动滚动到最后一条
	areaMsgList.scrollTop = areaMsgList.scrollHeight + areaMsgList.offsetHeight;
};

function bindtapForSendMsg(friend){
	// 获取我自己的用户信息					
	var me = app.getUserGlobalInfo();
	
	// 获取消息输入框与发送按钮对象
	var msg_text = document.getElementById("msg-text");
	var send = document.getElementById("send");
	
	// 为发送按钮绑定事件
	send.addEventListener("tap", function() {
	
		// 发送之前判断网络的状态
		if(!isNetConnected()){
			// 未连接
			return
		}
		
		// 获取消息内容
		var msg_text_val = msg_text.value
	
		// 判断消息内容，如果长度等于0，则return
		if (msg_text_val.length === 0) {
			return
		}
	
		// 发送消息, 渲染消息的html到msg div之下
		sendMsg(me, msg_text_val)
		// 发送后清空消息文本框中的内容
		msg_text.value = ""
		
		// receiveMsg(friend,"模拟接受消息~~~~~~");
		
		var friendUserId = friend.friendUserId
		// 构建ChatMsg
		var chatMsg = new app.ChatMsg(me.id, friendUserId, msg_text_val, null)
		// 构建DataContent
		var dataContent = new app.DataContent(app.msgAction.CHAT, chatMsg, null)
	
		// 调用websocket 发送消息到netty后端
		// var wsWebview = plus.webview.getWebviewById("chatlist.html");
		// wsWebview.evalJS("CHAT.chat('" + JSON.stringify(dataContent) + "')");
		// wsWebview.evalJS("CHAT.chat('" + msg_text_val + "')");
		CHAT.chat(JSON.stringify(dataContent))
	
		// 保存聊天历史记录到本地缓存
		app.saveUserChatHistory(me.id, friendUserId, msg_text_val, app.msgBelongTo.ME)
		app.saveUserChatSnapshot(me.id, friendUserId, msg_text_val, true)
	})
}

function isNetConnected(){
	var connectionStatus = plus.networkinfo.getCurrentType()
	if (connectionStatus == 0 || connectionStatus == 1) {
		app.showToast("请打开网络连接...", "error")
		return false
	}
	return true
}

// 发送消息
function sendMsg(me, msg) {
	var faceImg = app.imgServerUrl+me.faceImage
	var msgHtml = '<div class="me_lists">' +
		'<div class="header_img">' +
		'<img src="' + faceImg + '" width="40px" height="40px" />' +
		'</div>' +
		'<div class="msg-wrapper left">' +
		'<p class="msg-right-green">' + msg + '</p>' +
		'</div>' +
		'</div>';
	var msg_list = document.getElementById("msg");
	msg_list.insertAdjacentHTML("beforeend", msgHtml);

	playSendMsgSound();
}

// 接受消息
function receiveMsg(friend,msg) {

	var msgHtml = '<div class="friend_lists">' +
		'<div class="header_img">' +
		'<img src="' + app.imgServerUrl + friend.friendFaceImage + '" width="40px" height="40px" />' +
		'</div>' +
		'<div class="msg-wrapper right">' +
		'<p class="msg-left-white">' + msg + '</p>' +
		'</div>' +
		'</div>';

	var msg_list = document.getElementById("msg");
	msg_list.insertAdjacentHTML("beforeend", msgHtml);

	playReceiveMsgSound();
}

// 播放发送消息的铃声
function playSendMsgSound() {
	var audioPlayer = plus.audio.createPlayer("/mp3/send.mp3");
	audioPlayer.play();
}

// 播放接受消息的铃声
function playReceiveMsgSound() {
	var audioPlayer = plus.audio.createPlayer("/mp3/di_didi.mp3");
	audioPlayer.play();
}


