var page = 1 // 起始页
var pageSize = 10 // 每页记录数
var total // 总页数


var files = [];
mui.plusReady(function() {
	window.addEventListener("refresh",function(){
		document.getElementById('main').innerHTML=""
		page = 1
		pageSize = 10
		initdData()
	})
	// 初始化页面数据
	initdData()

	// 页面触低事件
	onReachBotton()
	// 视频图标点击事件，打开选择菜单
	onVideoIcon()
	// 选择菜单事件
	onLinkCamera() // 相机
	onLinkChooseFromAblum() // 从相册选择
})

// 页面触底事件
function onReachBotton() {
	document.addEventListener("plusscrollbottom", function() {
		plus.nativeUI.showWaiting()
		if (!hasMoreData()) {
			console.log('not have more data')
			setTimeout(function() {
				plus.nativeUI.closeWaiting()
				app.showToast('客官，我是有底线的', null)
			}, 1000)
			return
		}

		page = page + 1
		setTimeout("fetchMoreVideos(" + page + ")", 1000)
	}, false)
}


function initdData() {
	plus.nativeUI.showWaiting()
	fetchMoreVideos(page)
}

function fetchMoreVideos(page) {
	var user = app.getUserGlobalInfo()
	// 获取数据
	http.request({
		url: '/video/list?userId='+user.id+'&page=' + page + '&pageSize=' + pageSize,
		success: resolveRes
	})
}

function resolveRes(data) {
	console.log(JSON.stringify(data.rows[0]))
	total = data.total
	// 数据渲染
	var oParent = document.getElementById('main')

	// 往页面添加子元素，初步渲染数据
	addItem(oParent, data.rows)
	// 瀑布流渲染
	var headerHeight = document.getElementById('header').offsetHeight
	setTimeout("waterfall('main', 'box', " + headerHeight + ")", 200)

	// 绑定点击事件
	mui("#main").on("tap", ".box", function(e) {
		var videoId = this.getAttribute('videoId')
		var reg = this.offsetHeight / this.offsetWidth
		// 进入视频详情页面
		mui.openWindow({
			url: "video-detail.html",
			id: "video-detail.html", //
			extras: {
				videoId: videoId,
				reg: reg
			}
		})
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

// 判断是否还有更多数据
function hasMoreData() {
	console.log('page total ' + (page < total))
	if (page < total) {
		return true
	}
	return false
}

function addItem(oParent, data) {
	console.log('add item to mian div')
	var imgWidth = (document.body.clientWidth - 32) / 2
	for (var i = 0; i < data.length; i++) {

		var oBox = document.createElement('div')
		oBox.className = 'box'
		oBox.setAttribute("videoId", data[i].id)
		oBox.setAttribute("like_status", data[i].like_status)
		// console.log(oBox.getAttribute('videoId'))
		oParent.appendChild(oBox)

		var oPic = document.createElement('div')
		oPic.className = 'pic'
		oBox.appendChild(oPic)

		var oImg = document.createElement('img')
		oImg.src = app.mediaServerUrl + data[i].coverPath
		oImg.style.width = imgWidth + 'px'
		oPic.appendChild(oImg)

		var oFace = document.createElement('div')
		oFace.className = 'face'
		// oFace.style.position='absolute'
		// oFace.style.bottom= '8px'
		// oFace.style.left='4px' 
		oPic.appendChild(oFace)
		var faceImg = document.createElement('img')
		if(app.isNotNull(data[i].faceImage)){
			faceImg.src = app.imgServerUrl+data[i].faceImage
		}else{
			faceImg.src = '../../images/face/default.png'
		}
		oFace.appendChild(faceImg)

		var oLike = document.createElement('div')
		oLike.className = 'like'
		oPic.appendChild(oLike)
		var spanIcon = document.createElement('span')
		if (data[i].like_status == 1) {
			spanIcon.className = 'iconfont icon-bg-like like-icon-green'
		} else {
			spanIcon.className = 'iconfont icon-bg-like like-icon-grey'
		}
		oLike.appendChild(spanIcon)
		var spanText = document.createElement('span')
		spanText.className = 'like-text'
		spanText.innerHTML = data[i].likeCounts
		oLike.appendChild(spanText)

	}
}


/*
    parend 父级id
    pin 元素id
*/
function waterfall(parent, box, headerHeight) {
	var oParent = document.getElementById(parent) // 父级对象
	var oBoxs = getItemsByClass(oParent, box) // 获取存储块框box的数组oBoxs
	console.log('box length' + oBoxs.length)
	if (oBoxs.length < 1) {
		return
	}
	var iBoxW = oBoxs[0].offsetWidth // 一个块框box的宽
	var num = Math.floor(document.documentElement.clientWidth / iBoxW) //每行中能容纳的box个数【窗口宽度除以一个块框宽度】
	oParent.style.cssText = 'width:' + iBoxW * num + 'px;margin:0 auto;' //设置父级居中样式：定宽+自动水平外边距

	var boxHArr = [] //用于存储 每列中的所有块框相加的高度。
	for (var i = 0; i < oBoxs.length; i++) { //遍历数组oBoxs的每个块框元素
		var boxH = oBoxs[i].offsetHeight
		if (i < num) {
			boxHArr[i] = boxH + headerHeight //第一行中的num个块框box 先添加进数组boxHArr
		} else {
			var minH = Math.min.apply(null, boxHArr) //数组boxHArr中的最小值minH
			var minHIndex = getMinHeightIndex(boxHArr, minH)
			oBoxs[i].style.position = 'absolute' //设置绝对位移
			oBoxs[i].style.top = minH + 'px'
			oBoxs[i].style.left = oBoxs[minHIndex].offsetLeft + 'px'
			//数组 最小高元素的高 + 添加上的oBoxs[i]块框高
			boxHArr[minHIndex] += oBoxs[i].offsetHeight //更新添加了块框后的列高
		}
	}
}

// 根据class获取元素
function getItemsByClass(parent, cName) {
	var boxArray = new Array() // className对应的元素
	var oElements = parent.getElementsByTagName('*') // 父元素下的所有元素

	// 将className 为 cName 的元素添加的boxArray中
	for (var i = 0; i < oElements.length; i++) {
		if (oElements[i].className === cName) {
			boxArray.push(oElements[i])
		}
	}

	return boxArray
}

function getMinHeightIndex(arr, val) {
	for (var i in arr) {
		if (arr[i] == val) {
			return i
		}
	}
}

// 数据块触碰底加载 
function checkScrollSlide() {
	var oParent = document.getElementById('main')
	var oBoxs = getItemsByClass(oParent, 'box')
	var lastBox = oBoxs[oBoxs.length - 1]
	// var lastBoxHeight = lastBox.offsetTop + Math.floor(lastBox.offsetHeight / 2)
	var lastBoxHeight = lastBox.offsetTop + Math.floor(lastBox.offsetHeight)

	// 界面脱离浏览器的高度
	var scrollTop = document.body.scrollTop || document.documentElement.scrollTop
	// var scrollTop = document.documentElement.scrollTop
	var height = document.documentElement.clientHeight
	console.log("scroll lastboxheight:" + lastBoxHeight + "scrollTop:" + scrollTop + "height:" + height)
	return (lastBoxHeight == scrollTop + height) ? true : false;
}
