<template>
  <!--TODO 完成md文章渲染(其他markdown文章) -->
  <!--TODO 完成代码高亮 -->
  <!--TODO 图片加载 -->
  <v-card style="overflow: auto" :height="height">
    <v-card-text v-if="readme.content" style="padding: 25px;">
      <div class="markdown-body" style="max-height:100%; overflow: auto;"
           v-html="readme.content" v-openlink="filePath"></div>
    </v-card-text>
    <!--<v-card-text></v-card-text>-->
    <v-speed-dial v-model="fab" bottom right style="position: fixed;"
                  :open-on-hover="false" :transition="transition" :direction="direction">
      <v-btn slot="activator" color="blue darken-2" dark fab v-model="fab">
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <!-- TODO 代码树Dialog显示 -->
      <v-btn fab dark small color="indigo">
        <v-icon>view_list</v-icon>
      </v-btn>
      <!-- TODO 添加git clone项目到指定目录功能 -->
      <v-btn fab dark small color="green">
        <v-icon>file_download</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-card>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import filter from '../utils/filter'
import { base64ToUtf8 } from '../utils/escape'
export default {
  name: "File",
  props: {
    filePath: {
      type: String,
      required: true,
    },
    height: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data() {
    return {
      unknownType: false,
      fab: false,
      transition: 'slide-y-reverse-transition',
      direction: 'top',
    }
  },
  computed: {
    ...mapState({
      fileLoading: ({ common }) => common.fileLoading,
      file: ({ github }) => github.file,
      readme: ({ github }) => github.readme,
    }),
    fileContent() {
      if(this.file && this.file.size > 0 && this.file.content) {
        return base64ToUtf8(this.file.content)
      } else {
        return null
      }
    }
  },
  methods: {
    ...mapActions(['fileLoadingStill', 'fileLoadingComplete',
      'getStarredRepoReadme', 'getStarredRepoFile']),
  },
  mounted() {

  },
  watch: {
    filePath(newPath) {
      if (newPath) {
        const ownerEnd = newPath.indexOf('/')
        const repoEnd = newPath.indexOf('/', ownerEnd + 1)
        const owner = newPath.slice(0, ownerEnd)
        const repo = repoEnd === -1 ? newPath.slice(ownerEnd + 1) : newPath.slice(ownerEnd + 1, repoEnd)
        const path = repoEnd === -1 ? 'README.md' : newPath.slice(repoEnd + 1)

        if(filter.unknownType.test(path)) {
          this.unknownType = true
        } else {

          this.fileLoadingStill()

          if (path === 'README.md') {

            this.getStarredRepoReadme({
              owner,
              repo
            }).then(() => {
              this.fileLoadingComplete()
            }).catch(err => console.log(err))

          } else {

            this.getStarredRepoFile({
              owner,
              repo,
              path
            }).then(() => {
              this.fileLoadingComplete()
            }).catch(err => console.log(err))

          }
        }
      }
    }
  },
  created() {
    const { filePath } = this
    const ownerEnd = filePath.indexOf('/')
    const repoEnd = filePath.indexOf('/', ownerEnd + 1)
    const owner = filePath.slice(0, ownerEnd)
    const repo = repoEnd === -1 ? filePath.slice(ownerEnd + 1) : filePath.slice(ownerEnd + 1, repoEnd)
    const path = repoEnd === -1 ? 'README.md' : filePath.slice(repoEnd + 1)

    if(filter.unknownType.test(path)) {
      this.unknownType = true
    } else {

      this.fileLoadingStill()

      if (path === 'README.md') {

        this.getStarredRepoReadme({
          owner,
          repo
        }).then(() => {
          this.fileLoadingComplete()
        }).catch(err => console.log(err))

      } else {

        this.getStarredRepoFile({
          owner,
          repo,
          path
        }).then(() => {
          this.fileLoadingComplete()
        }).catch(err => console.log(err))

      }
    }
  }
}
</script>
<style lang="scss">
.markdown-body {
  :not(pre) {
    code {
      background-color: rgba(27,31,35,0.05);
      color: #000;
      padding: 2px;
      font-weight: normal;
      -webkit-box-shadow: none;
      box-shadow: none;
    }
  }
}
</style>