<template lang="pug">
  main
    el-row(type="flex", justify="center")
      el-col(:xs=18, :sm=18, :md=12)
        el-form(ref="form", :model="form", :rules="rules", label-position="top")

          el-form-item(:label="contents.repoSelectHint", prop="repo")
            el-select.block(v-model="form.repo", placeholder="")
              el-option(v-for="(link, repo) in contents.repos", :label="repo", :value="repo", :key="repo")

          el-form-item(:label="contents.issueTypesHint", prop="type")
            el-select.block(v-model="form.type", placeholder="")
              el-option(v-for="type in contents.issueTypes", :label="type", :value="type", :key="type")

          el-form-item(:label="contents.issueTitleHint", prop="title")
            el-input(v-model="form.title")

          template(v-if="isBug")
            el-form-item
              small
                p(v-text="contents.issueUsage")
                ul
                  li(v-for="l in contents.links[form.repo]", key="l.link")
                    span(v-text="l.desc")
                    a(:href="l.link", v-text="l.link")
                b(v-text="contents.issueHint")

            el-form-item(:label="contents.versionRepositoryHint", prop="versionRepository")
              el-select.block(v-model="form.versionRepository", filterable, :loading="loading.repository", :no-match-text="contents.noMatchText", :no-data-text="contents.noDataText", placeholder="")
                el-option(v-for="tag in version.repo", :label="tag", :value="tag", :key="tag")

            el-form-item(:label="contents.versionBrowserHint", prop="versionBrowser")
              el-input(v-model="form.versionBrowser")

            el-form-item(:label="contents.versionVueHint", prop="versionVue")
              el-select.block(v-model="form.versionVue", filterable, :loading="loading.vue", :no-match-text="contents.noMatchText", :no-data-text="contents.noDataText", placeholder="")
                el-option(v-for="tag in version.vue", :label="tag", :value="tag", :key="tag")

            el-form-item(:label="contents.reproduceHint", prop="reproduce")
              el-input(v-model="form.reproduce")

            el-form-item
              small
                p(v-text="contents.reproduceHintSamll")
                ul
                  li(v-for="l in contents.reproduceLinks")
                    a(:href="l.link", v-text="l.name")

            el-form-item(:label="contents.stepsHint", prop="steps")
              el-input(type="textarea", v-model="form.steps", :autosize="{ minRows: 5, maxRows: 10 }")

            el-form-item
              small(v-html="contents.stepsHintSmall")

            el-form-item(:label="contents.expectHint", prop="expect")
              el-input(type="textarea", v-model="form.expect", :autosize="{ minRows: 5, maxRows: 10 }")

            el-form-item(:label="contents.actualHint", prop="actual")
              el-input(type="textarea", v-model="form.actual", :autosize="{ minRows: 5, maxRows: 10 }")

          template(v-else)
            el-form-item(:label="contents.descHint", prop="desc")
              el-input(type="textarea", v-model="form.desc", :autosize="{ minRows: 5, maxRows: 10 }")

          el-form-item.center
            el-button(@click="preview", v-text="contents.preview", type="primary")


    el-dialog(:title="contents.dialog.title", v-model="show")
      div(v-html="issueHTML")
      span(slot="footer")
        el-button(type="primary", v-text="contents.dialog.button", @click="create")


</template>

<script>
  import contentLang from '../i18n/content'
  import axios from 'axios'
  import marked from 'marked'

  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  })

  export default {
    name: 'content',

    data () {
      return {
        form: {
          repo: '',
          title: '',
          type: '',
          desc: '',
          versionRepository: '',
          versionVue: '',
          versionBrowser: '',
          reproduce: '',
          steps: '',
          expected: '',
          actual: ''
        },
        show: false,
        loading: {
          repository: false,
          vue: false
        },
        version: {
          repo: [],
          vue: []
        },
        issue: ''
      }
    },

    computed: {
      lang () {
        return this.$route.path.split('/')[1] || window.navigator.language
      },

      contents () {
        return contentLang.filter(c => c.lang === this.lang)[0]
      },

      api () {
        return {
          repositoryVersion: `http://registry.npm.taobao.org/${this.repo}`,
          vueVersion: `http://registry.npm.taobao.org/vue`
        }
      },

      isBug () {
        return !this.contents.issueTypes.indexOf(this.form.type)
      },

      rules () {
        const valid = this.contents.valid
        let rules = {}
        for (let prop in valid) {
          rules[prop] = [
            {
              required: true,
              trigger: 'change',
              message: valid[prop]
            }
          ]
        }

        return rules
      },

      repo () {
        return this.contents.repos[this.form.repo]
      },

      issueHTML () {
        return marked(this.issue)
      },

      title () {
        const prefix = `[${this.isBug ? 'Bug Report' : 'Feature Request'}] `
        return encodeURIComponent(prefix + this.form.title).replace(/%2B/gi, '+')
      },

      body () {
        return encodeURIComponent(this.issue).replace(/%2B/gi, '+')
      }

    },

    watch: {
      lang: {
        handler () {
          this.$nextTick(() => {
            this.$refs.form.resetFields()
            const repos = this.contents.repos
            const key = Object.keys(repos)[0]
            this.form.repo = key
            this.form.versionRepository = this.version.repo[0]
            this.form.versionVue = this.version.vue[0]
            this.form.type = this.contents.issueTypes[0]
          })
        },
        immediate: true
      },

      'form.repo': {
        handler () {
          this.fetchRepositoryVersion()
        }
      }
    },

    methods: {
      preview () {
        this
          .$refs
          .form
          .validate(valid => {
            if (valid) {
              this.createIssue()
            }
          })
      },

      create () {
        window.open(`https://github.com/${this.repo}/issues/new?title=${this.title}&body=${this.body}`)
      },

      createIssue () {
        this.issue = this.isBug ? `
### ${this.form.repo} version
${this.form.versionRepository}

### OS/Browsers version
${this.form.versionBrowser}

### Vue version
${this.form.versionVue}

### Reproduction Link
${this.form.reproduce}

### Steps to reproduce
${this.form.steps}

### What is Expected?
${this.form.expect}

### What is actually happening?
${this.form.actual}
`.trim() : `
${this.form.desc}
`
        this.show = true
      },

      async fetchRepositoryVersion () {
        if (!this.form.repo) return
        const response = await axios.get(this.api.repositoryVersion)
        this.version.repo = Object.keys(response.data.versions)
        this.form.versionRepository = this.version.repo[0]
      },

      async fetchVueVersion () {
        const response = await axios.get(this.api.vueVersion)
        this.version.vue = Object.keys(response.data.versions)
        this.form.versionVue = this.version.vue[0]
      }
    },

    mounted () {
      this.fetchVueVersion()
    }
  }
</script>

<style lang="stylus">
  .el-select.block
    display block
  main
    padding-top 20px
  code
    background-color: #d93f0b;
    display: inline-block;
    padding: .25em .4em;
    font-weight: 700;
    line-height: 1.2em;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25rem;
    margin 0 5px
  small
    font-size 14px
  .el-form-item
    &.center
      text-align center
    label
      font-size 18px
  li
    a
      word-wrap break-word
</style>
