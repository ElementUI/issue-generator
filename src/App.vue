<template>
  <div id="app">
    <main-header></main-header>
    <router-view></router-view>
  </div>
</template>

<script>
import MainHeader from './components/header'

export default {
  name: 'app',

  components: {
    MainHeader
  }
}
</script>

<style>
  html, body, #app {
    margin: 0;
    padding: 0;
    height: 100%;
    min-width: 320px;
  }

  #app {
    height: 100%;
  }

  body {
    font-family: 'Helvetica Neue',Helvetica,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',SimSun,sans-serif;
    overflow: auto;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: #4078c0;
    text-decoration: none;
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }
</style>
