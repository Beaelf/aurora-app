mui.plusReady(function() {
	// console.log("contact list:" + JSON.stringify(app.getContactList()))

	// 绑定事件，show,refresh
	bindEventForThisWebview()

})

function bindEventForThisWebview() {
	// 监听当前webview的show事件
	var thisWebview = plus.webview.currentWebview()
	thisWebview.addEventListener("show", function() {
		// 获取全部好友
		fetchContactList()
		// 从缓存中获取联系人列表，并且渲染到页面
		renderContactPage()
		// 显示通讯录
		showList()
	})

	// 页面刷新事件
	window.addEventListener("refresh", function() {
		console.log('contact refresh event')
		fetchContactList()
		// 从缓存中获取联系人列表，并且渲染到页面
		renderContactPage()
		// 显示通讯录
		showList()
	})
}

// 26个字母外加 # 号
var enWords = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
	'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
	'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'
]

// 构建通讯录二维数组模型
var contactArray = [
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[]
]

// 清空通讯录模型数组
function clearContactArray() {
	contactArray = [
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	]
}

// 获取英文字母所在数组的位置
function getOrderOfEnWords(enChar) {
	for (var i = 0; i < enWords.length; i++) {
		if (enWords[i] == enChar) {
			return i
		}
	}
	// 如果没有对应的值，说明用户昵称的首字母是乱七八糟的字符或者数字或者表情
	return enWords.length - 1
}

// 从缓存中获取联系人列表，并且渲染到页面
function renderContactPage() {
	// 1. 获取联系人列表
	var friendList = app.getContactList()
	// 2. 循环好友列表，转换为拼音
	for (var i = 0; i < friendList.length; i++) {
		var friend = friendList[i]
		// 2.1 转换拼音
		var pingyin = words.convertPinyin(friend.friendNickname)
		// 2.2 截取拼音的首字母
		var firstChar = pingyin.substr(0, 1).toUpperCase()
		// 2.3 获取首字母在二维数组中的位置
		var index = getOrderOfEnWords(firstChar)
		// 2.4 获得顺序之后，塞入朋友
		contactArray[index].push(friend)
	}

	// 3. 构建通讯录html进行渲染
	var contactHtml = ''
	for (var i = 0; i < contactArray.length; i++) {
		var friendArray = contactArray[i]
		if (friendArray.length > 0) {
			// 显示首字母
			var nicknameStarter = enWords[i]
			contactHtml += '<li data-group="' + nicknameStarter + '" class="mui-table-view-divider mui-indexed-list-group">' +
				nicknameStarter + '</li>'
			// 显示相同首字母的所有联系人
			for (var j = 0; j < friendArray.length; j++) {
				console.log("friend face img:"+ JSON.stringify(friendArray[j]))
				contactHtml += '' +
					'<li friendUserId="' + friendArray[j].friendUserId + '" friendNickname="' + friendArray[j].friendNickname +
					'" friendFaceImage="' + friendArray[j].friendFaceImage +
					'" class="chat-with-friend mui-media mui-table-view-cell mui-indexed-list-item" style="padding: 8px 10px;">' +
					'<img class="mui-media-object mui-pull-left list-item-face" src="' + app.imgServerUrl + friendArray[j].friendFaceImage +
					'"/>' +
					'<div class="mui-media-body list-item-text" >' + friendArray[j].friendNickname + '</div>' +
					'</li>'
			}
		}
	}

	// 渲染html
	document.getElementById("contactList").innerHTML = contactHtml

	// 清空数组
	clearContactArray()

	// 为好友通讯录批量绑定点击事件
	mui("#contactList").on("tap", ".chat-with-friend", function(e) {
		var friendUserId = this.getAttribute("friendUserId")
		var friendNickname = this.getAttribute("friendNickname")
		var friendFaceImage = this.getAttribute("friendFaceImage")

		// 打开聊天子页面
		mui.openWindow({
			url: "../chat/chatting.html",
			id: "chatting-" + friendUserId, // 每个朋友的聊天页面都是唯一对应的
			extras: {
				friend: {
					friendUserId: friendUserId,
					friendNickname: friendNickname,
					friendFaceImage: friendFaceImage
				}
			}
		})

	})
}

// 获取后端所有好友列表
function fetchContactList() {
	var user = app.getUserGlobalInfo()
	http.request({
		url:"/user/" + user.id + "/get/friends",
		success:(data)=>{
			var contactList = data
			app.setContactList(contactList)
		}
	})
	// mui.ajax(app.serverUrl + "/user/" + user.id + "/get/friends", {
	// 	data: {},
	// 	dataType: 'json', //服务器返回json格式数据
	// 	type: 'get', //HTTP请求类型
	// 	timeout: 10000, //超时时间设置为10秒；
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	success: function(data) {
	// 		// console.log('contact list:' + JSON.stringify(data.data))
	// 		if (data.status == 200) {
	// 			var contactList = data.data
	// 			app.setContactList(contactList)
	// 		}
	// 	}
	// })
}

// 显示通讯录
function showList() {
	var list = document.getElementById('list')
	list.style.height = document.body.offsetHeight + "px"
	// 创建列表显示
	window.indexedList = new mui.IndexedList(list)
}
