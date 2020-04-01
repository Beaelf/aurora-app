// console.log('this is inde js')
var mPages = [{
		pageId: "chatlist.html",
		pageUrl: "chat/chatlist.html"
	},
	{
		pageId: "contact.html",
		pageUrl: "contact/contact.html"
	},
	{
		pageId: "discover.html",
		pageUrl: "discover/discover.html"
	},
	{
		pageId: "me.html",
		pageUrl: "me/me.html"
	}
]

var mPagesStyle = {//44
	top: "46px",
	bottom: "50px"
}

mui.plusReady(function() {
	// 设置app标题
	setTitle(app.appName)

	// 禁止返回到登录注册页面
	mui.back = function() {
		return false
	}

	// 对网络连接进行事件监听
	netChangeSwitch()

	// 获取当前的webview对象
	var currentWebview = plus.webview.currentWebview()

	// 向当前的主页webview追加子页的4张webview对象
	for (var i = 0 ;i < mPages.length; i++) {
		var page = plus.webview.create(mPages[i].pageUrl,mPages[i].pageId,mPagesStyle)
		// 隐藏webview窗口
		page.hide()
		// 追加每一个子页面到当前主页面
		currentWebview.append(page)
	}
	
	// 默认展示页面为聊天窗口
	plus.webview.show(mPages[0].pageId)

	// 批量绑定tap事件，展示不同的页面
	mui(".mui-bar-tab").on("tap", "a", function() {
		var tabindex = this.getAttribute("tabindex")

		// 显示点击的tab选项所对应的页面
		plus.webview.show(mPages[tabindex].pageId, "fade-in", 200)

		// 隐藏其他的不需要的页面
		for (var i = 0 ;i < mPages.length ;i++) {
			if (i != tabindex) {
				plus.webview.hide(mPages[i].pageId, "fade-out", 200)
			}
		}
	})

	// 延时加载
	setTimeout("initData()", "1000")
})

// 监听网络状态更改
function netChangeSwitch() {
	console.log('listen net change')
	document.addEventListener("netchange", function() {
		// 网络状态获取和判断
		var connectionStatus = plus.networkinfo.getCurrentType()
		if (connectionStatus != 0 && connectionStatus != 1) {
			// 重新打开网络连接
			setTitle(app.appName)
			var mtitle = document.getElementById("mtitle")
			mtitle.innerHTML = "<b>"+app.appName+"</b>"
		} else {
			// 关闭网络连接
			setTitle(app.appName+"(未连接)")
		}
	})
}

function setTitle(title){
	var mtitle = document.getElementById("mtitle")
	mtitle.innerHTML = "<b>"+title+"</b>"
}

// 预加载
function initData() {
	console.log('index init data method')
	var chatlist = plus.webview.getWebviewById("chatlist.html")
	mui.fire(chatlist, "refresh")

	var me = plus.webview.getWebviewById("me.html")
	mui.fire(me, "refresh")
	
	
	var contact = plus.webview.getWebviewById("contact.html")
	mui.fire(contact,"refresh")
	
	CHAT.init()
}
