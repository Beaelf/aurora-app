window.http = {

	request: function(params) {
		console.log('http request method params:' + JSON.stringify(params))
		// 设置参数
		var url = params.url
		var data = params.data || {}
		var type = params.type || 'GET'
		console.log('request params:{url:'+url+',type:'+type+',data:'+JSON.stringify(data)+'}')
		// 发起请求
		mui.ajax(app.serverUrl + url, {
			data: data,
			dataType: 'json', //服务器返回json格式数据
			type: type, //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			headers: {
				'Content-Type': 'application/json'
			},
			success: (data, textStatus, xhr) => {
				plus.nativeUI.closeWaiting()
				console.log('success')
				var statusStr = xhr.status + ''
				if (statusStr.startsWith('2')) {
					params.success && params.success(data)
				} else {
					console.log('error:' + textStatus)
					this.show_error(xhr.response.code)
				}
			},
			error: (xhr, type, errorThrown) => {
				plus.nativeUI.closeWaiting()
				//异常处理；
				console.log("error "+type+ " xhr status:" + xhr.status + ",response:" + xhr.response)
				var errorStatus = xhr.status + ''
				if (errorStatus.startsWith('4')) {
					this.show_error(4000)
					console.log('show error')
					return
				}

				var res = JSON.parse(xhr.response)
				this.show_error(res.code)


			}
		})
	},
	show_error: function(error_code) {
		console.log(error_code)
		if (!error_code) {
			error_code = 1000
		}
		console.log(error_code)
		var tip = this.tips[error_code]
		console.log('tip' + JSON.stringify(tip))
		app.showToast(tip ? tip : this.tips[1000], "error")
	},
	tips: {
		400: '客户端通用错误',
		0: 'OK',
		1: '无此用户',
		2: '不能添加你自己',
		3: '该用户已经是你的好友',
		999: '服务器异常',
		1000: '通用错误',
		1001: '通用参数错误',
		1002: '资源未找到',
		1003: '没有找到合适的登陆处理方法',
		1004: '令牌不合法或者过期',
		1005: '用户未被授权',
		1006: '登录失败，用户名或密码不正确',
		1007: '注册失败',
		1008: '二维码上传出错',
		1009: '头像上传出错',
		2000: '用户类通用错误',
		2001: '用户已存在',
		2002: '用户不存在',
		2003: '用户密码错误',
		2004: '获取用户tokenId失败',
		3000: '你未点赞过赞',
		3001: '你已经赞过了',
		3002: '没有找到你上传的视频',
		3003: '视频上传出错'
	}
}
