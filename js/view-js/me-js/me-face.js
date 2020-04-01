mui.plusReady(function() {
	// 初始化头像
	loadFace()

	// 添加自定义事件，刷新头像
	window.addEventListener("refresh", function() {
		loadFace()
	})
	

	// 绑定选择菜单
	var openMenu = document.getElementById("openMenu")
	openMenu.addEventListener("tap", function() {
		mui("#sheet-myface").popover("toggle")
	})


	// 绑定选择照片的菜单按钮
	var link_choosePhoto = document.getElementById("link_choosePhoto")
	link_choosePhoto.addEventListener("tap", function() {
		mui("#sheet-myface").popover("toggle")
		mui.openWindow({
			url: "../../plugin/v3.1.6/myface-uploader.html",
			id: "myface-uploader.html",
			createNew: true
		})
	})

	// 绑定保存照片的菜单按钮
	var link_savePhoto = document.getElementById("link_savePhoto")
	link_savePhoto.addEventListener("tap", function() {

		mui("#sheet-myface").popover("toggle")
		plus.nativeUI.showWaiting("下载中...")

		var user = app.getUserGlobalInfo()
		var faceImage = user.faceImageBig

		var dtast = plus.downloader.createDownload(
			app.imgServerUrl + faceImage, {},
			function(downloadFile, status) {

				plus.nativeUI.closeWaiting();

				if (status != 200) {
					app.showToast("下载错误...", "error")
					console.log("下载错误...")
					return
				}

				var tempFile = downloadFile.filename
				// 通过相册api保存照片到本地相册
				plus.gallery.save(tempFile, function() {
					app.showToast("保存照片成功！", "success")
				})

			}
		);
		dtast.start() // 启动下载任务

	});
});

function loadFace() {
	var img_face = document.getElementById("img_face")
	// 获取手机端可见屏幕的宽度
	var imgWidth = document.body.clientWidth
	img_face.width = imgWidth
	img_face.height = imgWidth
	
	
	var user = app.getUserGlobalInfo()
	if (!user) {
		return
	}
	var faceImage = user.faceImageBig
	if (app.isNotNull(faceImage)) {
		img_face.src = app.imgServerUrl + faceImage
	}
}
