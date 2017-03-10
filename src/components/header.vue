<template lang="pug">
  nav
    el-menu(theme="dark", mode="horizontal", :default-active="language", :router="true")
      li
        a(href="https://github.com/ElemeFE", target="_blank")
          img(src="../assets/images/logo.png")
      el-menu-item.right(index="zh-CN") 中文
      el-menu-item.right(index="en-US") English
</template>

<script>
  export default {
    name: 'header',

    data () {
      return {
        language: ''
      }
    },

    computed: {
      lang () {
        return this.$route.path.split('/')[1] || window.navigator.language
      }
    },

    watch: {
      lang: {
        handler (val) {
          this.language = val
        },
        immediate: true
      }
    }
  }
</script>

<style lang="stylus">
  .el-menu--horizontal
    li
      float left
      height 60px
      line-height 60px
      margin 0
      cursor pointer
      position relative
      box-sizing border-box
      color #bfcbd9
      padding 0 20px
      img
        margin-top 11px
        height: 38px
    .el-menu-item.right
      float right
</style>
