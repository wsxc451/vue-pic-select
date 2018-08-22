<template>
  <div id="app">
    <vue-pic-select :upload-url="uploadUrl" :on-selected="selected" :on-fail="onFail" :on-list-fail="onListFail" :headers="headers" :list-url="listUrl"></vue-pic-select>
  </div>
</template>

<script>
    import Vue from 'vue';
    // import vuePicSelect from './index';
    import vuePicSelect from 'vue-pic-select';
    console.log(vuePicSelect);
    Vue.use(vuePicSelect,{});
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
        listUrl:'http://www.osadmin.com/index.php/api/pic/lists',
        uploadUrl:'http://www.osadmin.com/index.php/api/pic/upload',
        headers:{"access-token":'91b7ef46e2c19044fc2324a1e40db7d4'}
    }
  },
    methods:{
        selected(data){
            console.log(data)
        },
        onFail(data){
            console.log(data)
        },
        onListFail(data){
            alert(data)
        }
    }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
