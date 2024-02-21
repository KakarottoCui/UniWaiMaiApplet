<template>
	
	<view class="u-p-20">
		
		<u-cell-group>
			<u-cell-item v-for="(item ,index) in typeList" :key="index"  :title="item.name" :arrow="false">
				
				<view slot="right-icon">
					
					<text class="u-m-r-20" @click="show=true;form=item;">修改</text><text @click="del(item)">删除</text>
					
				</view>
				
			</u-cell-item>
		</u-cell-group>
		<u-button type="primary" @click="add">新增</u-button>
		<u-popup v-model="show" mode="center">
			<view class="u-p-25 " style="box-shadow: 1px 1px 5px lightcyan;">
				<u-form ref="uForm">
					<u-form-item label="分类名" label-width="110" prop="name">
						<u-input v-model="form.name" />
					</u-form-item>
					
				</u-form>
				<u-button type="primary" @click="changeType">提交</u-button>
			</view>
		</u-popup>
		
		
		
	</view>
	
</template>

<script>
	import appRequest from "@/common/appRequestUrl.js";
	export default {
		data() {
			return {
				typeList: [],
				form:{
					validFlag:1,
					name: "",
					id: ""
				},show:false
			};
		},onLoad() {
			this.getGoodsType();
		},methods:{
			add(){
				this.show = true;
				this.form = {
					validFlag:1,
					name: "",
					id: ""
				}
			},
			del:function(item){
				this.form = item;
				this.form.validFlag =0;
				this.changeType();
			},
			changeType(){
				let _this = this;
				if(!this.form.name ){
					_this.$api.msg('分类名未填写');
					return;
				}
				appRequest.request({
					method: "POST",
					data:{
						data:JSON.stringify(this.form)
					},
					url: appRequest.changeType,
					success: function(res) {
						if (res.data.code == 200) {
							_this.$api.msg('成功');
							_this.getGoodsType();
							_this.show = false;
						} else {
							_this.$api.msg('类型获取失败');
						}
					},
					fail: function(res) {
						_this.$api.msg("请求异常");
					}
				})
			}
			,
			getGoodsType() {
			
				let _this = this;
				appRequest.request({
					method: "POST",
					url: appRequest.getGoodsType,
					success: function(res) {
						if (res.data.code == 200) {
							_this.typeList = res.data.data;
						} else {
							_this.$api.msg('类型获取失败');
						}
						
						
						
					},
					fail: function(res) {
						_this.$api.msg("请求异常");
					}
				})
			}
		}
	}
</script>

<style lang="scss">

</style>
