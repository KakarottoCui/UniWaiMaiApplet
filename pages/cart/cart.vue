<template>
	<view class="container">
		<!-- 空白页 -->
		<view v-if="!user || cartList.length==0" class="empty">
			<image src="/static/emptyCart.jpg" mode="aspectFit"></image>
			<view v-if="user" class="empty-tips">
				空空如也
				<navigator class="navigator" v-if="user" url="../index/index" open-type="switchTab">随便逛逛></navigator>
			</view>
			<view v-else class="empty-tips" v-if="!user">
				空空如也
				<view class="navigator" @click="navToLogin">去登录></view>
			</view>
		</view>
		<view v-else>
			<!-- 列表 -->
			<view class="cart-list">
				<block v-for="(item, index) in cartList" :key="item.id">
					<view
						class="cart-item" 
						:class="{'b-b': index!==cartList.length-1}"
					>
					
						
							<image class="image-wrapper" :src=" picUrl + item.pid"
								mode="aspectFill" 
								lazy-load 
							></image>
							<view 
								class="yticon icon-xuanzhong2 checkbox"
								:class="{checked: item.checked}"
								@click="check('item', index,item.id)"
							></view>
						
						<view class="item-right">
							<text class="clamp title">{{item.name}}</text>
							<text class="price">¥{{item.price}}</text>
							<uni-number-box 
								class="step"
								:min="1" 
								:max="10"
								:value="item.num>10?10:item.num"
								:isMax="item.num>=10?true:false"
								:isMin="item.num===1"
								:index="index"
								@eventChange="numberChange($event,item.id)"
							></uni-number-box>
						</view>
						<text class="del-btn yticon icon-fork" @click="deleteCartItem(index,item.id,0,0)"></text>
					</view>
				</block>
			</view>
			<!-- 底部菜单栏 -->
			<view class="action-section">
				<view class="checkbox u-font-35">总价
					<!-- <image 
						:src="allChecked?'/static/selected.png':'/static/select.png'" 
						mode="aspectFit"
						@click="check('all')"
					></image>
					<view class="clear-btn" :class="{show: allChecked}" @click="clearCart">
						清空
					</view> -->
				</view>
				<view class="total-box">
					<text class="price">¥{{total}}</text>
					<!-- <text class="coupon">
						已优惠
						<text>74.35</text>
						元
					</text> -->
				</view>
				<button type="primary" class="no-border confirm-btn" @click="createOrder">去结算</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import appRequest from "@/common/appRequestUrl.js";
	import uniNumberBox from '@/components/uni-number-box.vue'
	export default {
		components: {
			uniNumberBox
		},
		data() {
			return {
				picUrl:appRequest.getPicById,
				total: 0, //总价格
				allChecked: false, //全选状态  true|false
				empty: false, //空白页现实  true|false
				cartList: [],
				user:false,
				selList:[]
			};
		},
		onLoad(){
			//this.loadData();
			//this.getGoodsItem();
		},
		watch:{
			//显示空白页
			cartList(e){
				let empty = e.length === 0 ? true: false;
				if(this.empty !== empty){
					this.empty = empty;
				}
			}
		},
		computed:{
			//...mapState(['hasLogin'])
			
		},onShow() {
			this.user = appRequest.getUserInfo();
			if(this.user)
				this.getGoodsItem();

		},
		methods: {
			changeGoodsItem(gid,changeType,num){
				let _this = this;
				let info = {
					id:gid,
					num:num,
					changeType:changeType,
					type:1
				};
				appRequest.request({
					method: "POST",
					url: appRequest.addGoodsItem,
					data:{
						data:JSON.stringify(info)
					},
					success: function(res) {
						if(res.data.code == 200){
							_this.$api.msg("修改成功");
						}else{
							_this.$api.msg(res.data.msg);
						}
					},
					fail: function(res) {
						_this.$api.msg("请求异常");
					}
				})
				
			},
			getGoodsItem(){
				let _this = this;
				appRequest.request({
					method: "POST",
					url: appRequest.getGoodsItem,
					success: function(res) {
						if(res.data.code == 200){
							_this.cartList = res.data.data;
							_this.cartList.map(function(obj,index,arr){
								obj['checked'] = false;
							});
						}else{
							_this.$api.msg(res.data.msg);
						}
				
					},
					fail: function(res) {
						_this.$api.msg("请求异常");
					}
				})
			},
			//请求数据
			async loadData(){
				let list = await this.$api.json('cartList'); 
				let cartList = list.map(item=>{
					item.checked = true;
					return item;
				});
				this.cartList = cartList;
				this.calcTotal();  //计算总价
			},
			//监听image加载完成
			onImageLoad(key, index) {
				this.$set(this[key][index], 'loaded', 'loaded');
			},
			//监听image加载失败
			onImageError(key, index) {
				this[key][index].image = '/static/errorImage.jpg';
			},
			navToLogin(){
				uni.navigateTo({
					url: '/pages/public/login'
				})
			},
			 //选中状态处理
			check(type, index,id){
				if(type === 'item'){
					this.cartList[index].checked = !this.cartList[index].checked;
				}else{
					const checked = !this.allChecked
					const list = this.cartList;
					list.forEach(item=>{
						item.checked = checked;
					})
					this.allChecked = checked;
				}
				
				this.calcTotal(type);
			},
			//数量
			numberChange(data,id){
				let count = data.number - this.cartList[data.index].num;
				this.cartList[data.index].num = data.number;
				this.changeGoodsItem(id,1,count);
				this.calcTotal();
			},
			//删除
			deleteCartItem(index,gid,changeType,num){
				
				this.changeGoodsItem(gid,changeType,num);
				
				let list = this.cartList;
				let row = list[index];
				let id = row.id;
				
				this.cartList.splice(index, 1);
				this.calcTotal();
				uni.hideLoading();
				
			},
			//清空
			clearCart(){
				uni.showModal({
					content: '清空购物车？',
					success: (e)=>{
						if(e.confirm){
							this.cartList = [];
						}
					}
				})
			},
			//计算总价
			calcTotal(){
				let list = this.cartList;
				if(list.length === 0){
					this.empty = true;
					return;
				}
				let total = 0;
				let checked = true;
				list.forEach(item=>{
					if(item.checked === true){
						total += item.price * item.num;
					}else if(checked === true){
						checked = false;
					}
				})
				this.allChecked = checked;
				this.total = Number(total.toFixed(2));
			},
			//创建订单
			createOrder(){
				if(this.user.type != 1){
					this.$api.msg("管理员及商家不能参与购物，请使用消费者帐户购买");
					return;
				}
				this.selList = [];
				for(let i=0;i<this.cartList.length;i++){
					let obj = this.cartList[i];
					if(obj.checked){
						this.selList.push({
							id:obj.id,
							gid:obj.goodsFk,
							num:obj.num
						});
					}
				}
				
				if(this.selList.length < 1){
					this.$api.msg("请勾选至少一件商品，点击左上角可选中商品");
					return;
				}
				let list = this.selList
				// let list = this.cartList;
				// let goodsData = [];
				// list.forEach(item=>{
				// 	if(item.checked){
				// 		goodsData.push({
				// 			attr_val: item.attr_val,
				// 			number: item.number
				// 		})
				// 	}
				// })

				uni.navigateTo({
					url: `/pages/order/createOrder?data=${JSON.stringify(
						list
					)}`
				})
				//this.$api.msg('跳转下一页 sendData');
			}
		}
	}
</script>

<style lang='scss'>
	.container{
		padding-bottom: 134upx;
		/* 空白页 */
		.empty{
			position:fixed;
			left: 0;
			top:0;
			width: 100%;
			height: 100vh;
			padding-bottom:100upx;
			display:flex;
			justify-content: center;
			flex-direction: column;
			align-items:center;
			background: #fff;
			image{
				width: 240upx;
				height: 160upx;
				margin-bottom:30upx;
			}
			.empty-tips{
				display:flex;
				font-size: $font-sm+2upx;
				color: $font-color-disabled;
				.navigator{
					color: $uni-color-primary;
					margin-left: 16upx;
				}
			}
		}
	}
	/* 购物车列表项 */
	.cart-item{
		display:flex;
		position:relative;
		padding:30upx 40upx;
		.image-wrapper{
			width: 230upx;
			height: 230upx;
			flex-shrink: 0;
			position:relative;
			z-index: 0;
			border-radius:8upx;
		}
		.checkbox{
			position:absolute;
			left:8upx;
			top: 8upx;
			z-index: 8;
			font-size: 44upx;
			line-height: 1;
			padding: 4upx;
			color: $font-color-disabled;
			background:#fff;
			border-radius: 50px;
		}
		.item-right{
			display:flex;
			flex-direction: column;
			flex: 1;
			overflow: hidden;
			position:relative;
			padding-left: 30upx;
			.title,.price{
				font-size:$font-base + 2upx;
				color: $font-color-dark;
				height: 40upx;
				line-height: 40upx;
			}
			.attr{
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				height: 50upx;
				line-height: 50upx;
			}
			.price{
				height: 50upx;
				line-height:50upx;
			}
		}
		.del-btn{
			padding:4upx 10upx;
			font-size:34upx; 
			height: 50upx;
			color: $font-color-light;
		}
	}
	/* 底部栏 */
	.action-section{
		/* #ifdef H5 */
		margin-bottom:100upx;
		/* #endif */
		position:fixed;
		left: 30upx;
		bottom:30upx;
		z-index: 95;
		display: flex;
		align-items: center;
		width: 690upx;
		height: 100upx;
		padding: 0 30upx;
		background: rgba(255,255,255,.9);
		box-shadow: 0 0 20upx 0 rgba(0,0,0,.5);
		border-radius: 16upx;
		.checkbox{
			height:52upx;
			position:relative;
			image{
				width: 52upx;
				height: 100%;
				position:relative;
				z-index: 5;
			}
		}
		.clear-btn{
			position:absolute;
			left: 26upx;
			top: 0;
			z-index: 4;
			width: 0;
			height: 52upx;
			line-height: 52upx;
			padding-left: 38upx;
			font-size: $font-base;
			color: #fff;
			background: $font-color-disabled;
			border-radius:0 50px 50px 0;
			opacity: 0;
			transition: .2s;
			&.show{
				opacity: 1;
				width: 120upx;
			}
		}
		.total-box{
			flex: 1;
			display:flex;
			flex-direction: column;
			text-align:right;
			padding-right: 40upx;
			.price{
				font-size: $font-lg;
				color: $font-color-dark;
			}
			.coupon{
				font-size: $font-sm;
				color: $font-color-light;
				text{
					color: $font-color-dark;
				}
			}
		}
		.confirm-btn{
			padding: 0 38upx;
			margin: 0;
			border-radius: 100px;
			height: 76upx;
			line-height: 76upx;
			font-size: $font-base + 2upx;
			background: $uni-color-primary;
			box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72)
		}
	}
	/* 复选框选中状态 */
	.action-section .checkbox.checked,
	.cart-item .checkbox.checked{
		color: $uni-color-primary;
	}
</style>
