<template>

    <div class="select-pic-box" >
        <div  :style="btnStyle" class="picBoxBtn"  @click="openPicBox">选择图片</div>

        <div class="pic-box" v-show="innerShowBox" >
            <div class="picForm" ref="pic_box" id="pic_form"  :style="{width:boxWidth+'px'}">
                <div class="header">
                    <div>
                        <div class="header_btns" style="float: left;">
                            <input style="display: none;" ref="uploadBtn" name="file" type="file" :multiple="ismulti"
                                   accept="image/png,image/gif,image/jpeg" @change="_upload" />
                            <button   @click="()=>{ this.$refs.uploadBtn.click()}">上传图片</button>
                        </div>

                        <div class="header_close"  style="text-align: right;float: right;">
                            <span style=""  @click="closeBox">X</span>
                        </div>
                    </div>
                </div>
                <div class="body">
                    <div :class="`imgs ${o.active&&o.active==true?'active':''}`" v-for="o in picLists" :key="o.id"
                         :style="{width:imgWidth+'px',height:imgWidth+'px'}"
                         @click="onSelectedImg(o)">
                        <img :src="o.path"  />
                    </div>
                </div>

                <div class="footer">
                    <div class="footer_page">
                        <span :class="{active:index==currentPage}" @click="handleCurrentChange(index)" v-for="index in this.totalPage">{{index}}</span>
                    </div>
                    <div class="footer_btns">
                        <button   @click="commitSelected">确认选择</button>
                    </div>
                </div>
            </div>
        </div>
        <slot>

        </slot>
    </div>
</template>

<script>
    function noop() {}
    import axios from 'axios';

    export default {
        name: 'vue-pic-select',
        componentName: 'vue-pic-select',
        props: {
            onChange: {
                type: Function,
                default: noop
            },
            onPreview: {
                type: Function
            },
            onSuccess: {
                type: Function,
                default: noop
            },
            onFail: {
                type: Function,
                default: noop
            },
            onListSuccess:{
                type: Function,
                default: noop
            },
            onListFail: {
                type: Function,
                default: noop
            },
            onSelected:{
                type: Function,
                default: noop
            },
            boxWidth:{
              type:Number,
              default:700
            },
            listUrl:{
                type:String,
                require:true
            },
            uploadUrl:{
                type:String,
                require:true
            },
            headers:{
                type: Object,
                default: function () {
                    return {"access-token":localStorage.access_token || ''} //上传图片一般会带着token验证权限
                }
            },
            ismulti:{ //是否支持多选
                type:Boolean,
                default:false
            },
            btnStyle:{
                type:String,
                default:''
            },
            listParams:{
                type: Object,
                default: function () {
                    return {   }
                }
            },
        },
        data() {
            return {
                listError:false,
                uploadError:false,
                picLists:[],
                pageSize:10,
                imgWidth:0,
                totalCount:0,
                currentPage: 1,
                totalPage:0,
                fileList:[],
                picFM: {
                    startTime: '',
                    endTime: ''
                },
                page:1,
                cid:null,
                innerShowBox:false,
                selectedImgs:[],
                dateVal:'',
                pickerOptions2: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                }
            };
        },
        watch:{
            picLists:function (data) {
                this._addListsActiveClass();
                this._calPages();
            },
            selectedImgs:function (data) {
                this._addListsActiveClass()
            }
        },
        mounted(){
            //动态计算列表图片宽高
            this._calImgsWidth();
        },
        methods: {
            _calImgsWidth() {
                let padding = 10*2;// 图片直接间距10,每行5个图片
                let width = this.boxWidth -padding;
                let imgWidth = (width - 10*4)/5 ;
                this.imgWidth = imgWidth;
            },
            _calPages() {
                let pageSize = this.pageSize;
                let totalCount = this.totalCount;
                let totalPage = Math.ceil(totalCount / pageSize);
                this.totalPage = totalPage;
            },
            _upload(e) {   // 上传照片
                let files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    let file = e.target.files[i];
                    this._uploadOne(file);
                }
            },
            _uploadOne(file) {
                let self = this;
                /* eslint-disable no-undef */
                let param = new FormData()  // 创建form对象
                param.append('file', file, file.name)  // 通过append向form对象添加数据
                //param.append('chunk', '0') // 添加form表单中其他数据
                console.log(param.get('file')) // FormData私有类对象，访问不到，可以通过get判断值是否传进去
                let config = {
                    headers: {'Content-Type': 'multipart/form-data', ...this.headers}
                };
                // 添加请求头
                self.uploadError = false;
                axios.post(self.uploadUrl, param, config)
                    .then(response => {
                        if (response.data.success === true) {
                            self.uploadError = false;
                            self.onSuccess({file:file});
                            self.currentPage = 1;
                            self._getPicLists();
                        }else{
                            self.uploadError = true;
                            self.onFail({file:file});
                        }
                    }).catch(err=>{
                      self.uploadError = true;
                      self.onFail({file:file});
                  })
            },
            _getPicLists(cb) {
                let that = this;
                that.listError=false;
                axios.get(this.listUrl, {
                        headers: this.headers,
                        params: {page: this.currentPage, pageSize: this.pageSize, showPage: true, params: this.listParams}
                    }
                ).then((ret) => {
                    that.picLists = ret.data.data;
                    that.totalCount = ret.data.count;
                    that.onListSuccess(ret.data);
                    that.listError=false;
                    cb&&cb(ret);
                })
                .catch(function (response) {
                    that.onListFail(response.toString());
                    that.listError=true;
                    cb&&cb(response);
                });
            },
            commitSelected() {
                let ret = {ismulti: this.ismulti, imgs: this.selectedImgs};
                //console.log('ret',ret);
                //this.$emit('selected-callback', ret);
                this.onSelected(ret);
                this.selectedImgs = [];
                this.innerShowBox = false;
                //  this._addListsActiveClass();
                //  this._addListsActiveClass();
            },
            openPicBox() {
                this._getPicLists(()=>{
                    if(this.listError==false){
                        this.innerShowBox = true;
                    }
                });
            },
            closeBox() {
                this.selectedImgs = [];
                this.innerShowBox = false;
            },
            onSelectedImg(item) {
                //select-img
                if (this.ismulti == true) {
                    if (this._isExits(this.selectedImgs, item.id)) {
                        this.selectedImgs = this.selectedImgs.filter((img) => {
                            return img.id != item.id;
                        });
                    } else {
                        this.selectedImgs.push({
                            path: item.path,
                            id: item.id,
                            from: item.from
                        });
                    }
                } else {
                    if (this._isExits(this.selectedImgs, item.id)) {
                        this.selectedImgs = [];
                    } else {
                        this.selectedImgs = [{
                            path: item.path,
                            id: item.id,
                            from: item.from
                        }];
                    }
                }
            },
            handleCurrentChange(index) {
                this.currentPage = index;
                this._getPicLists();
            },
            _addListsActiveClass() {
                let selImgs = this.selectedImgs || [];
                this.picLists.map((item) => {
                    let index = selImgs.findIndex((img) => {
                        return img.id == item.id;
                    });
                    if (index >= 0) {
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                });
                this.$forceUpdate();
            },
            _isExits(arr, id, keyname = 'id') {
                let index = arr.findIndex((img) => {
                    return img[keyname] === id;
                });
                return index >= 0 ? true : false;
            }
        }

    };
</script>

<style scoped>
    .picBoxBtn{font-size:12px;display: inline-block;cursor: pointer; background: #409EFF;color: #fff; border: none; height: 30px;line-height: 30px;padding: 0 20px;}
    .pic-box{position: fixed;top: 0;left: 0;right: 0;bottom:0; background: rgba(0,0,0,.8);z-index: 999;display: flex;
        justify-content: center;align-items: center; }
    .picForm{ flex-direction: column;min-height: 400px;display: flex;flex: 1; overflow: hidden;
        padding: 10px;box-sizing: border-box; position: fixed; background: #fff;}
    .picForm .header{ display: flex; flex-direction: column; border-bottom: 1px solid #e3e3e3;height: 50px;}
    .picForm .header button{display: inline-block; background: #409EFF;color: #fff; border: none; height: 30px;line-height: 30px;padding: 0 20px;}
    .header_close span{cursor: pointer; display: inline-block;width: 25px;height: 25px; line-height: 25px; text-align: center;  border: 1px solid #e3e3e3; border-radius: 50%;}
    .picForm .body{ margin-top: 10px; display: flex; width: 100%; box-sizing: border-box;
        flex: 1;border-bottom: 1px solid #e3e3e3; flex-wrap:wrap;  flex: 1;  }
    .picForm .footer{ height: 80px;  display: flex; margin: 10px 0;flex-direction: column; align-items: flex-start;}
    .picForm .footer .footer_page{height: 40px;}
    .picForm .footer .footer_page span{ font-size: 14px;color: #409EFF;margin-right: 10px;cursor: pointer;padding: 0px 8px;border:1px solid #e3e3e3;}
    .picForm .footer .footer_page span.active{background: #F56C6C; color: #fff;}
    .picForm .footer .footer_btns{height: 40px;}
    .picForm .footer .footer_btns button{background: #F56C6C;color: #fff; border: none; height: 30px;line-height: 30px;padding: 0 20px;}
    .imgs{display: block; margin-right: 10px; margin-bottom: 10px;  border: 1px solid #e3e3e3; overflow: hidden; box-sizing: border-box;}
    .imgs:nth-child(5n){display: block; margin-right: 0px;    border: 1px solid #e3e3e3; overflow: hidden;box-sizing: border-box;}
    .imgs.active{ border: 1px solid #ff5500;}
    .imgs img{ display:block;max-width: 100%; overflow: hidden;}
</style>