var reg
var files = []
var user

var tempFatherCommentId = null
var tempToUserId = null
mui.plusReady(function() {
	// 初始化页面数据
	initData()

	// 调整页面
	adjustPageStyle()
})

function initData() {
	user = app.getUserGlobalInfo()
	// 获取上个页面传入的数据
	var currentWebview = plus.webview.currentWebview()
	var videoId = currentWebview.videoId
	reg = currentWebview.reg
	// console.log('videoId ' + videoId + ' like_status:' + like_status)

	// 获取后端数据
	fetchVideoDetail(videoId)

	// 返回按钮,返回上个页面
	onBackIcon()
	// 评论界面显示/隐藏控制
	onSheetComment()
	// 输入框获得焦点让软键盘跟输入框覆盖
	onInputItem()
	// 评论
	onSendBtn(videoId)

	// 视频图标点击事件，打开选择菜单
	onVideoIcon()
	// 选择菜单事件
	onLinkCamera() // 相机
	onLinkChooseFromAblum() // 从相册选择

}

function fetchVideoDetail(videoId) {
	http.request({
		url: '/video/' + videoId + '/detail?userId=' + user.id,
		success: resolveRes
	})
}

function resolveRes(data) {
	// 设置发布者头像
	initFaceImg(data.faceImage)
	// 设置视频播放路径、封面
	initVideo(data.coverPath, data.videoPath)
	// 设置视频描述
	initDes(data.videoDesc)
	// 设置红心状态
	initLikeIcon(data)
	// 设置评论
	initComments(data.id, data.comments)
	// 分享
	initShare(data)

}

function initFaceImg(faceImg) {
	var ofaceImg = document.getElementById('face-img')
	if (app.isNotNull(faceImg)) { // 没有则使用默认头像
		ofaceImg.src = app.imgServerUrl + faceImg
	}
}

function initVideo(coverPath, videoPath) {
	var oVideo = document.getElementById('m-video')
	oVideo.poster = app.mediaServerUrl + coverPath
	oVideo.src = app.mediaServerUrl + videoPath
	// 绑定视频播放暂停事件
	oVideo.addEventListener("tap", videoPlayOrPause)
}

function initDes(des) {
	var odes = document.getElementById('video-des')
	odes.innerHTML = des
}

function initLikeIcon(data) {
	var like_status = data.like_status
	var oLikeSpan = document.getElementById('span-like')
	// 保存点赞状态
	oLikeSpan.setAttribute("like_status", like_status)
	if (like_status == 1) {
		console.log('like')
		oLikeSpan.style.cssText = "color: #FF5053 !important;"
	}
	// 点赞事件
	oLikeSpan.addEventListener("tap", function() {
		var like_status = this.getAttribute("like_status")
		if (like_status != 1) {
			oLikeSpan.style.cssText = "color: #FF5053 !important;"
			http.request({
				url: '/' + user.id + '/like/video?videoId=' + data.id + '&createrId=' + data.userId,
				type: 'POST',
				success: () => {
					this.setAttribute("like_status", 1)
				}
			})
		} else {
			oLikeSpan.style.cssText = "color: #CCCCCC !important;"
			http.request({
				url: '/' + user.id + '/cancel/like/video?videoId=' + data.id + '&createrId=' + data.userId,
				type: 'Post',
				success: () => {
					this.setAttribute("like_status", 0)
				}
			})
		}
	})
}

function initComments(videoId, comments) {
	console.log('this is init Comments method')
	if (app.isNotNull(comments)) {
		console.log('comments is not null')
		var oComments = document.getElementById('ul-comment1')
		var oSheetCommentUl = document.getElementById('sheet-comment-ul')
		oComments.innerHTML = ''
		oSheetCommentUl.innerHTML = ''
		var commentsHtml = ''
		for (var i = 0; i < comments.length; i++) {
			var comment = comments[i]
			var faceImg = '../../images/face/default.png' // 默认头像
			if (comment.faceImage) {
				faceImg = app.imgServerUrl + comment.faceImage
			}


			var toStr = comment.nickname
			if (app.isNotNull(comment.toNickname)) {
				toStr += '<font style="color:#51874c;">回复 </font>' + comment.toNickname + ':'
			} else {
				toStr += ':'
			}
			commentsHtml += '<li videoId="' + videoId + '" fatherCommentId="' + comment.id + '" toUserId="' + comment.fromUserId +
				'">' +
				'<img src=' + faceImg + ' />' +
				'<label class="comment-content">' + toStr + comment.comment + '<font class="comment-date">' + comment.timeAgoStr +
				'</font></label>' +
				'</li>'
		}
		oComments.innerHTML = commentsHtml

		oSheetCommentUl.innerHTML = commentsHtml
		bindtapForSheetCommentUlLi()


		var liArr = oComments.getElementsByTagName('li')
		console.log("liArr length:" + liArr.length)
		//评论数大于三才滚动
		if (liArr.length > 3) {
			// 评论内容滚动效果
			rollComments(100)
		}
	}
}

function initShare(data) {
	var oShareSpan = document.getElementById('span-share')
	oShareSpan.addEventListener("tap", function() {
		console.log('share tap event')
		// 分享
		plus.share.sendWithSystem({
			type: "video", // 类型
			content: "来自Aurora应用的分享", // 
			pictures: [app.mediaServerUrl + data.coverPath],
			thumbs: [app.mediaServerUrl + data.coverPath],
			media: app.mediaServerUrl + data.videoPath,
			title: "Aurora分享",
			interface: "editable"
		}, function() {
			console.log("share success")
		}, function() {
			console.log("share error")
		})
	})
}

function bindtapForSheetCommentUlLi() {
	mui("#sheet-comment-ul").on("tap", "li", function() {
		// 让输入框获得焦点
		var oInput = document.getElementById("comment-text")
		oInput.focus()

		//  获取参数
		var content = oInput.value
		var fatherCommentId = this.getAttribute("fatherCommentId")
		var toUserId = this.getAttribute("toUserId")
		var videoId = this.getAttribute("videoId")

		tempFatherCommentId = fatherCommentId
		tempToUserId = toUserId
	})

}


// 发表评论
function onSendBtn(videoId) {
	var oSend = document.getElementById('send')
	oSend.addEventListener("tap", function() {


		console.log('[send]fid:' + tempFatherCommentId + ',uid:' + tempToUserId)
		// 获取评论内容
		var oInput = document.getElementById("comment-text")
		var content = oInput.value
		// 判断输入内容
		if (content.length < 1 || content.length > 12) {
			app.showToast("评论内容在1-12之间")
			return
		}
		// return
		http.request({
			url: '/video/add/comment',
			type: 'POST',
			data: {
				fatherCommentId: tempFatherCommentId || null,
				toUserId: tempToUserId || null,
				fromUserId: user.id,
				videoId: videoId,
				comment: content
			},
			success: (data) => {
				// 清空输入框内容
				oInput.value = ''
				// 关闭评论面板
				var oHideComment = document.getElementById('hide-comment')
				// mui.trigger(oHideComment,'tap')
				// 刷新页面评论数据
				initComments(videoId, data)
				console.log(JSON.stringify(data))
			}
		})
	})
}
// 返回按钮,返回上个页面
function onBackIcon() {
	var oBack = document.getElementById('back')
	oBack.addEventListener("tap", function() {
		mui.back()
		videoPlayOrPause()
	})
}
// 评论界面显示/隐藏控制
function onSheetComment() {
	var oSheetComment = document.getElementById('sheet-comment')
	// 打开发表评论界面
	var oCommentSpan = document.getElementById('span-comment')
	oCommentSpan.addEventListener("tap", function() {
		console.log('open comment sheet')
		oSheetComment.style.display = 'block'
	})
	// 隐藏发表评论界面
	var oHideComment = document.getElementById('hide-comment')
	oHideComment.addEventListener("tap", function() {
		oSheetComment.style.display = 'none'
	})
}
// 输入框获得焦点让软键盘跟输入框覆盖
function onInputItem() {
	var oInput = document.getElementById('comment-text')

	var oSheetComment = document.getElementById('sheet-comment')
	var oHeader = document.getElementById('header')
	var oFooterRight = document.getElementById('div-footer-right')
	var oFooter = document.getElementById('footer-comments')
	oInput.addEventListener("focus", function() {
		console.log('set static')
		oSheetComment.style.position = "static"
		oHeader.style.position = "static"
		oFooterRight.style.position = "static"
		oFooter.style.position = "static"
	})
	oInput.addEventListener("blur", function() {
		oSheetComment.style.position = "fixed"
		oHeader.style.position = "absolute"
		oFooterRight.style.position = "absolute"
		oFooter.style.position = "absolute"
	})

	oInput.addEventListener("tap", function() {
		tempFatherCommentId = null
		tempToUserId = null
	})
}

// 打开选择菜单
function onVideoIcon() {
	var openmenu = document.getElementById("openmenu");
	openmenu.addEventListener("tap", function() {
		console.log("[moments]:打开选择菜单")
		mui('#sheet_moment').popover('toggle')
	})
}
// 从相册选择
function onLinkChooseFromAblum() {
	var oChooseFromAblumLink = document.getElementById('link_choosefromablum')
	oChooseFromAblumLink.addEventListener("tap", function() {
		mui('#sheet_moment').popover('toggle')
		appendByGallery()
	})
}
// 相机拍摄
function onLinkCamera() {
	var oCameraLink = document.getElementById('link_camera')
	oCameraLink.addEventListener('tap', function() {

	})
}
// 从相册添加文件
function appendByGallery() {
	console.log("[moments]:appendByGallery");
	plus.gallery.pick(function(p) {
		// console.log("[upload]file:"+p);
		files.push({
			name: "uploadkey",
			path: p
		});
		mui.openWindow({
			url: "bgmlist.html",
			id: "bgmlist.html",
			style: {},
			extras: {
				videoArr: files
			}
		});
	}, function(e) {
		console.log("取消选择图片");
	}, {
		filter: "video"
	});
}


function videoPlayOrPause() {
	var oVideo = document.getElementById('m-video')
	if (oVideo.paused || oVideo.ended) {
		console.log('play')
		oVideo.play()
	} else {
		oVideo.pause()
	}
}

function adjustPageStyle() {
	var phoneW = document.body.offsetWidth
	var phoneH = document.body.offsetHeight
	var contentH = reg * phoneW
	var mTop = Math.floor((phoneH - contentH) / 2) + 24
	console.log(mTop)
	var oContent = document.getElementById('div-content')
	oContent.style.cssText = "margin-top:" + mTop + "px"

}

function rollComments(t) {
	console.log('roll start')
	var ul1 = document.getElementById("ul-comment1");
	var ul2 = document.getElementById("ul-comment2");
	var ulbox = document.getElementById("footer-comments");
	ul2.innerHTML = ul1.innerHTML;
	ulbox.scrollTop = 0; // 开始无滚动时设为0
	var timer = setInterval(rollStart, t); // 设置定时器，参数t用在这为间隔时间（单位毫秒），参数t越小，滚动速度越快
	// 鼠标移入div时暂停滚动
	ulbox.onmouseover = function() {
		clearInterval(timer);
	}
	// 鼠标移出div后继续滚动
	ulbox.onmouseout = function() {
		timer = setInterval(rollStart, t);
	}
}
// 开始滚动函数
function rollStart() {
	// console.log('roll start')
	// 上面声明的DOM对象为局部对象需要再次声明
	var ul1 = document.getElementById("ul-comment1");
	var ulbox = document.getElementById("footer-comments");
	// 正常滚动不断给scrollTop的值+1,当滚动高度大于列表内容高度时恢复为0
	if (ulbox.scrollTop >= ul1.scrollHeight) {
		ulbox.scrollTop = 0;
	} else {
		ulbox.scrollTop++;
	}
}
