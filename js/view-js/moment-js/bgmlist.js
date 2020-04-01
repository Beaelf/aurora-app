var files = [];
// 文件上传路径
var server = app.serverUrl + '/upload/video';
// 用于标识正在播放的音乐，初始化为1：未播放任何音乐
var playingBgmId = -1;
var playingAudio = null;

mui.plusReady(function() {
	// console.log('this is bgm choose page')
	// 加载bgm页面
	loadBgms()

	// 获取上一个页面传入的对象
	var currnetWebview = plus.webview.currentWebview();
	files = currnetWebview.videoArr;
})


/**
 * 加载背景音乐
 */
function loadBgms() {
	plus.nativeUI.showWaiting();
	http.request({
		url: '/bgm/list',
		success: resolveLoadBgmRes
	})
}

function resolveLoadBgmRes(data) {
	console.log("bgm:" + JSON.stringify(data));
	// 获取所有的音乐
	renderBgms(data)

	// 给每个音乐标签绑定控制事件
	bindTapForBgmItems()

}

function renderBgms(bgms) {
	var bgmlist = document.getElementById("bgmlist");
	bgmlist.innerHTML = ''
	var bgmlistHtml = ''
	// 渲染数据到页面
	for (var i = 0; i < bgms.length; i++) {
		var bgm = bgms[i]
		bgmlistHtml += '<li class="mui-table-view-cell mui-media">' +
			'<span class="mui-pull-left iconfont icon-yinle1 media-left"></span>' +
			'<span class="mui-media-body  media-center"  id="">' + bgm.author + '-' + bgm.name + '</span>' +
			'<span class="mui-pull-right iconfont icon-bofang media-right" path="' +
			bgm.path + '"  bgmId="' + bgm.id + '" id="bgm-' + bgm.id + '" played="false"></span>' +
			'</li>'
	}
	bgmlist.innerHTML = bgmlistHtml
}

function bindTapForBgmItems() {
	mui("#bgmlist").on("tap", ".media-right", function(e) {
		console.log('right')
		// 当前音乐的id
		var currentBgmId = this.getAttribute("bgmId")
		//获取当前音乐播放路径
		console.log('path' + this.getAttribute("path"))
		var path = app.mediaServerUrl + this.getAttribute("path")
		console.log(path)
		// 播放状态
		var played = this.getAttribute("played")


		// 创建播放音乐
		var audio = plus.audio.createPlayer(path)

		// 首次进入
		if (playingBgmId == -1) {
			playingBgmId = currentBgmId
			playingAudio = audio
			audio.play()
			playBgm(this, audio)
			return
		}
		if (currentBgmId == playingBgmId) { // 是当前的bgm
			// console.log('self')
			if (played == "true") {
				audio.pause()
				pauseBgm(this)
			} else {
				audio.play()
				playBgm(this)
			}
		} else { // 不是正在播放的bgm
			// console.log('not self')
			// 关闭正在播放的Bgm
			var oPlayingBgm = document.getElementById('bgm-' + playingBgmId)
			pauseBgm(oPlayingBgm)

			//播放当前的bgm
			playingBgmId = currentBgmId
			playingAudio = audio
			audio.play()
			playBgm(this)
		}
	})
}
// 播放bgm
function playBgm(me) {
	console.log('play bgm:' + me.id + JSON.stringify(me.classList))
	me.setAttribute("played", true)
	me.classList.remove("icon-bofang")
	me.classList.add("icon-zanting")
	// me.className="mui-pull-right iconfont icon-zanting media-right"
}
// 暂停播放bgm
function pauseBgm(me) {
	console.log('pause bgm:' + me.id + JSON.stringify(me.classList))
	me.setAttribute("played", false)
	me.classList.remove("icon-zanting");
	me.classList.add("icon-bofang");
	// me.className="mui-pull-right iconfont icon-bofang media-right"
}

// 上传文件
function upload() {
	var me = this
	// 判断是否有选择文件
	if (files.length <= 0) {
		plus.nativeUI.alert('没有添加上传视频！')
		return
	}
	var des = document.getElementById("des").value
	if (des.length > 12) {
		//alert("密码长度不能大于12");
		app.showToast("描述内容不能超过12字", "error");
		return
	}

	// outSet('开始上传：');
	plus.nativeUI.showWaiting()
	var task = plus.uploader.createUpload(
		server, 
		{
			method: 'POST'
		},
		function(t, status) { //上传完成
			plus.nativeUI.closeWaiting()
			if (status == 200) {
				console.log('上传成功：' + t.responseText)
				app.showToast('上传成功',"success")
				if(me.playingAudio!=null){
					me.playingAudio.stop()
				}
				var moment = plus.webview.getWebviewById("moment.html")
				mui.fire(moment, "refresh")
				mui.back()

			} else {
				console.log('上传失败：'+status)
				plus.nativeUI.closeWaiting()
			}
		}
	)
	task.addData("userId", app.getUserGlobalInfo().id)
	console.log('bgmId:'+playingBgmId)
	task.addData('bgmId', playingBgmId!=-1?playingBgmId:null)
	task.addData("des", des != null?des:null)
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		task.addFile(f.path, {
			key: f.name
		});
	}
	task.start();
}
