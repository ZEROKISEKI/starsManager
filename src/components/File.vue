<template>
  <v-card style="overflow: auto" :height="height">
    <v-progress-circular indeterminate :size="70" :width="7" :style="loadingStyle"
                         v-show="fileLoading" color="purple"></v-progress-circular>
    <v-card-text v-if="isMarkdown && hasContent" style="padding: 25px;">
      <div class="markdown-body" style="max-height:100%; overflow: auto;"
           v-html="fileContent" v-openlink="filePath"></div>
    </v-card-text>
    <v-card-text v-else-if="isPic && hasContent" style="padding: 25px;">
      <div class="project-picture" style="max-height:100%; overflow: auto; text-align: center;">
        <img :src='"data:image/png;base64," + fileContent'>
      </div>
    </v-card-text>
    <v-card-text v-else-if="isCode && hasContent" style="padding: 25px;">
      <div class="markdown-body" style="max-height:100%; overflow: auto;">
        <pre>
          <code v-highlightjs>
            <span v-for="(line, index) in codeContent">{{ index === 0 ? '\n' : '' }}{{ line }}{{ index === codeContent.length - 1 ? '' : '\n' }}</span>
          </code>
        </pre>
      </div>
    </v-card-text>
    <v-card-text v-else-if="fileFailed" style="padding: 25px;">
      <div style="max-height:100%; overflow: auto;">
        <h3 style="text-align: center;">{{ $t('message.noFile') }}</h3>
      </div>
    </v-card-text>
    <!-- TODO 修改判断: offline但已经git clone的可以加载 -->
    <v-speed-dial v-model="fab" bottom right style="position: fixed;" v-if="filePath !== null"
                  :open-on-hover="false" :transition="transition" :direction="direction">
      <v-btn slot="activator" color="blue darken-2" dark fab v-model="fab">
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn fab dark small color="indigo" @click="openTree = true">
        <v-icon>view_list</v-icon>
      </v-btn>
      <v-btn fab dark small color="green">
        <v-icon>file_download</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-dialog v-model="openTree" width="600px" id="tree-dialog" max-width="600px">
      <v-progress-circular indeterminate :size="70" :width="7" :style="loadingStyle"
                           v-show="treeLoading" color="purple"></v-progress-circular>
      <tree :repoTree="repoTree" v-if="!treeLoading"></tree>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { unknownType, imageType } from '../utils/filter'
import Tree from './Tree.vue'
export default {
  name: "File",
  props: {
    height: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data() {
    return {
      unknownFileType: false,
      fab: false,
      transition: 'slide-y-reverse-transition',
      direction: 'top',
      openTree: false,
      loadingStyle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: '-35px',
        marginTop: '-35px'
      }
    }
  },
  components: {
    Tree
  },
  computed: {
    ...mapState({
      offline: ({ common }) => common.offline,
      fileLoading: ({ common }) => common.fileLoading,
      fileFailed: ({ common }) => common.fileFailed,
      treeLoading: ({ common }) => common.treeLoading,
      file: ({ github }) => github.file,
      filePath: ({ github }) => github.filePath,
      readme: ({ github }) => github.readme,
      owner: ({ github }) => github.owner,
      repo: ({ github }) => github.repo,
      repoTree({ github }) {
        for (let tree of github.starredReposTree) {
          if (tree.owner === this.owner && tree.repo === this.repo) {
            return tree
          }
        }
        return {}
      }
    }),
    isMarkdown() {
      return `${this.owner}/${this.repo}` === this.filePath || this.filePath.substr(-3) === '.md'
    },
    isPic() {
      return imageType.test(this.filePath) &&
        this.file.path && `${this.owner}/${this.repo}/${this.file.path}` === this.filePath
    },
    isCode() {
      return !imageType.test(this.filePath) && !unknownType.test(this.filePath) &&
        this.file.path && `${this.owner}/${this.repo}/${this.file.path}` === this.filePath
    },
    hasContent() {
      return this.file.size > 0 || this.readme.size > 0
    },
    fileContent() {
      if(/README\.md$/.test(this.filePath) || `${this.owner}/${this.repo}` === this.filePath) {
        return this.readme.content
      } else {
        return this.file.content
      }
    },
    codeContent() {
      return this.fileContent.split('\n')
    }
  },
  methods: {
    ...mapActions(['fileLoadingStill', 'fileLoadingComplete', 'treeLoadingStill', 'treeLoadingComplete',
      'getStarredRepoReadme', 'getStarredRepoFile', 'getStarredRepoTree', 'setFilePath']),
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

        if(unknownType.test(path)) {
          this.unknownFileType = true
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
    },
    openTree(newValue) {
      if (newValue) {
        if(!this.repoTree.hasOwnProperty('owner')) {
          this.treeLoadingStill()
          const { owner, repo } = this
          this.getStarredRepoTree({
            owner,
            repo
          }).then(() => {
            this.treeLoadingComplete()
          }, err => console.log(err))
        } else {
          this.treeLoadingComplete()
        }
      }
    },
  },
  created() {
    const { filePath } = this
    const ownerEnd = filePath.indexOf('/')
    const repoEnd = filePath.indexOf('/', ownerEnd + 1)
    const owner = filePath.slice(0, ownerEnd)
    const repo = repoEnd === -1 ? filePath.slice(ownerEnd + 1) : filePath.slice(ownerEnd + 1, repoEnd)
    const path = repoEnd === -1 ? 'README.md' : filePath.slice(repoEnd + 1)

    if(unknownType.test(path)) {
      this.unknownFileType = true
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
  code {
    background-color: rgba(27,31,35,0.05);
    color: #000;
    padding: 2px;
    font-weight: normal;
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}
.dialog__content {
  align-items: baseline;
}
</style>