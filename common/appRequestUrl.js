const baseUrl = "http://192.168.1.6:9091/GoodMall";

const login = baseUrl +"/login/login";//参数data

const regist = baseUrl +"/login/regist";//参数data

const loginCheck = baseUrl +"/getUserInfo";//获取微信账号信息

const getUncheckStore = baseUrl +"/user/getUncheckStore";

const setUncheckStore =  baseUrl +"/user/setUncheckStore";

const getGoodsType = baseUrl +"/store/getGoodsType";

const saveGoods = baseUrl +"/goods/saveGoods";

const getPicById = baseUrl + "/goods/getPicById?id=";//参数id

const getGoods = baseUrl + "/goods/getGoods";//参数data

const getGoodsByStore = baseUrl + "/goods/getGoodsByStore";

const addGoodsItem = baseUrl + "/goods/addGoodsItem";

const getGoodsItem = baseUrl + "/goods/getGoodsItem";

const saveOrders = baseUrl + "/order/saveOrders";

const getOrder =  baseUrl + "/order/getOrder";

const setOrder = baseUrl + "/order/setOrder";

const setCommnt =  baseUrl + "/order/setCommnt";

const getCommnt = baseUrl + "/order/getCommnt";

const changeType = baseUrl +"/changeType";

const changeUser = baseUrl +"/changeUser"

const getUserInfo = function(){
	try {
		const value = uni.getStorageSync('user');
		console.log(JSON.stringify(value));
		return value ? value : false;
	} catch (e) {
		return false;
	}
}

const request = function(requestOpt) {
	try {
		requestOpt = requestOpt || {};
		if (!requestOpt.url) {
			requestFail();
			return;
		}
		requestOpt.data = requestOpt.data || {};
		requestOpt.method = requestOpt.method || 'POST';
		
		try {
			const value = uni.getStorageSync('user');
			requestOpt.header = requestOpt.header || {
				'content-type': 'application/x-www-form-urlencoded'
			};
			requestOpt.header['token'] = value.token;
			if (value) {
				requestOpt.data['token'] = value.token;
			}
		} catch (e) {
			requestOpt.data['token'] = "";
		}
		
		
		requestOpt.timeout = requestOpt.timeout || 30000;
		requestOpt.responseType = requestOpt.responseType || 'text';
		requestOpt.dataType = requestOpt.dataType || "json";
		requestOpt.sslVerify = requestOpt.sslVerify || true;
		requestOpt.success = requestOpt.success || function(res) {};
		requestOpt.fail = requestOpt.fail || function(res) {};
		requestOpt.complete = requestOpt.complete || function(res) {};
		uni.showLoading({title:"加载中"});
		
		uni.request({
			url: requestOpt.url,
			data: requestOpt.data,
			method: requestOpt.method,
			responseType: requestOpt.responseType,
			sslVerify: requestOpt.sslVerify,
			timeout: requestOpt.timeout,
			dataType: requestOpt.dataType,
			header: requestOpt.header,
			success: function(res) {
				requestOpt.success(res);
			},
			fail: function(res) {
				requestOpt.fail(res);
			},
			complete: function(res) {
				uni.hideLoading();
			}
		});
	} catch (e) {
		//TODO handle the exception
		uni.hideLoading();
		uni.showToast({
			icon:"none",
			title:"请求异常"
		})
	}
}

const goodsCache = {
	
	save:function(item){
		try {
			uni.setStorageSync('selGoods', item);
		} catch (e) {
			
		}
	},getCache:function(){
		try {
			const value = uni.getStorageSync('selGoods');
			if (value) {
				return value;
				uni.removeStorageSync('selGoods');
			}
		} catch (e) {
		}
		return false;
	}
}

export default {
	getUserInfo,
	regist,
	login,
	baseUrl,
	request,
	getUncheckStore,
	setUncheckStore,
	getGoodsType,
	saveGoods,
	getPicById,
	getGoodsByStore,
	getGoods,
	goodsCache,
	addGoodsItem,
	getGoodsItem,
	saveOrders,
	getOrder,
	setOrder,
	setCommnt,
	getCommnt,
	loginCheck,
	changeType,
	changeUser
}