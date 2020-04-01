mui.plusReady(function() {
	var user = app.getUserGlobalInfo();
	var qrcode = user.qrcode; // 二维码
	var userface = user.faceImage; // 头像
	var nickname = user.nickname; // 昵称

	// 获取页面元素
	var img_myface = document.getElementById("img_myface"); // 头像
	var lab_nickname = document.getElementById("lab_nickname"); //昵称
	var img_qrcode = document.getElementById("img_qrcode"); // 二维码

	lab_nickname.innerHTML = nickname;
	if (userface) {
		img_myface.src = app.imgServerUrl + userface;
	}
	if (qrcode) {
		img_qrcode.src = app.imgServerUrl + qrcode;
	}
	console.log(app.imgServerUrl + qrcode)

	// 获取手机端可见屏幕宽度
	var imgWidth = document.body.clientWidth - 60;
	img_qrcode.width = imgWidth;
	img_qrcode.height = imgWidth;


	// 保存二维码
	var download_qrcode = document.getElementById("download_qrcode");
	download_qrcode.addEventListener("tap", function() {

		plus.nativeUI.showWaiting("下载中...");

		var dtask = plus.downloader.createDownload(
			app.imgServerUrl + qrcode, {},
			function(d, status) {
				plus.nativeUI.closeWaiting();

				if (status != 200) {
					console.log("Download failed: " + status);
					return
				}

				console.log("Download success: " + d.filename);
				plus.gallery.save(d.filename, function() {
					app.showToast("保存图片到相册成功", "success");
				});
			});

		dtask.start();
	});
})
