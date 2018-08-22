"use strict";
import vuePicSelect from './lib/vue-pic-select';
const pisSelect = {
    install : function (Vue, options) {
        Vue.component(vuePicSelect.name, vuePicSelect);
        // 1. 添加全局方法或属性
        // Vue.myGlobalMethod = function () {
        //     // 逻辑...
        // }
        //
        // // 2. 添加全局资源
        // Vue.directive('my-directive', {
        //     bind (el, binding, vnode, oldVnode) {
        //         // 逻辑...
        //     }
        // })
        //
        // // 3. 注入组件
        Vue.mixin({
            created: function () {
                // 逻辑...
            },
            data(){
                return {
                }
            },
            methods:{
                _handlerImgStr(imgsyyzz){
                    let imgIds=[];
                    if(imgsyyzz&&imgsyyzz.length>0){
                        for(let i=0;i<imgsyyzz.length;i++){
                            imgIds.push(imgsyyzz[i].id);
                        }
                    }
                    return imgIds.join(",");
                }
            }
        })
        //
        // // 4. 添加实例方法
        // Vue.prototype.$myMethod = function (methodOptions) {
        //     // 逻辑...
        // }
}};


if (typeof window !== 'undefined' && window.Vue) { window.Vue.use(pisSelect); }

export default pisSelect;