<template>
  <v-container fluid class="mx-0 pa-0">
    <v-layout row>
      <v-flex md4 lg4 xl4 style="flex-basis: auto; -webkit-flex-basis: auto; min-width: 300px;">
        <v-card id="starred-list-card" style="position: relative; overflow: auto; max-width: 400px;"
                v-resize="onResize" :height="cardHeight" :key="name">
          <v-toolbar color="indigo" id="starred-list-card-toolbar"
                      dark absolute scroll-off-screen scroll-target="#scrolling-techniques">
            <v-spacer></v-spacer>
            <v-text-field :label="$t('message.starredList.search')" color="white" :key="name"
                          single-line append-icon="search" hide-details v-model="searchKeyWords"></v-text-field>
          </v-toolbar>
          <v-list three-line class="scroll-y" id="scrolling-techniques" style="max-height:100%; padding-top: 64px;">
            <template v-for="(repo, index) in searchStarredRepos">
              <v-list-tile :key="repo.id" avatar @click="changeFilePath(repo.full_name, $event)">
                <v-list-tile-content>
                  <v-list-tile-title>{{ repo.full_name }}</v-list-tile-title>
                  <v-list-tile-sub-title class="text--primary">{{ repo.description }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action class="py-3">
                  <v-list-tile-action-text>{{ stargazersCount(repo.stargazers_count) }} stars</v-list-tile-action-text>
                  <v-menu bottom left :disabled="!checkRepoOperation">
                    <v-btn icon slot="activator">
                      <v-icon>more_vert</v-icon>
                    </v-btn>
                    <v-list>
                      <v-list-tile @click="moveToClassification(repo.id)">
                        <v-list-tile-content>
                          <v-list-tile-title>{{ $t('message.starredList.itemOperation.move') }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile @click="removeFromClassification(repo.id)">
                        <v-list-tile-content>
                          <v-list-tile-title>{{ $t('message.starredList.itemOperation.remove') }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider v-if="index + 1 < starredRepos.length" :key="index"></v-divider>
            </template>
            <template v-if="searchStarredRepos.length === 0">
              <v-list-tile style="min-width: 320px;">
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.starredList.noList') }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
        <v-dialog max-width="350" persistent v-model="openMoveClassification">
          <v-card>
            <v-toolbar color="indigo" dark>
              <v-toolbar-title>{{ $t('message.starredList.itemOperation.moveToClassification') }}</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-list two-line>
              <v-list-tile avatar v-for="(item, index) in classification" :key="index">
                <v-list-tile-action style="width: 100%;">
                  <v-radio-group v-model="classificationName">
                    <v-radio :value="item.name" :label="item.name" :key="item.name"></v-radio>
                  </v-radio-group>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="cancelMoveClassification">
                {{ $t('message.cancel') }}
              </v-btn>
              <v-btn color="blue darken-1" flat @click.native="saveMoveClassification"
                     :disabled="classificationName === null">
                {{ $t('message.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-flex>
      <v-flex md8 lg8 xl8 style="max-width: 100%; flex-grow: 1; -webkit-flex-grow: 1; overflow-x: auto;">
        <file v-if="filePath !== null" :height="cardHeight"></file>
        <empty v-else></empty>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import File from './File.vue'
import Empty from './Empty.vue'
export default {
  name: "Custom",
  data() {
    return {
      name: null,
      cardHeight: 'auto',
      searchKeyWords: '',
      sortWay: null,
      openMoveClassification: false,
      moveRepoId: null,
      classificationName: null,
      originClassificationName: null,
    }
  },
  components: {
    File,
    Empty
  },
  computed: {
    ...mapState({
      filePath: ({ github }) => github.filePath,
      classification: ({ github }) => JSON.parse(JSON.stringify(github.classification)),
      allStarredRepos: ({ github }) => github.starredRepos
    }),
    keywords() {
      return new RegExp(this.searchKeyWords, 'i')
    },
    starredRepos() {
      const { repos = [] } = this.classification.find(e => e.name === this.name)
      return this.allStarredRepos.filter(repo => repos.indexOf(repo.id) !== - 1)
    },
    searchStarredRepos() {
      const repos = this.starredRepos.filter(repo => {
        return this.keywords.test(repo.name) || this.keywords.test(repo.owner.login)
      })

      if (!this.sortWay) {
        return repos
      } else if (this.sortWay === 'created_at') {
        return repos.sort((a, b) => {
          return new Date(b['created_at']) - new Date(a['created_at'])
        })
      } else if (this.sortWay === 'stargazers_count') {
        return repos.sort((a, b) => {
          return b['stargazers_count'] - a['stargazers_count']
        })
      }
    },
    checkRepoOperation() {
      return localStorage.getItem('starsManager-storage-repo-name') && this.classification.length > 0
    },
  },
  methods: {
    ...mapActions(['setFilePath', 'setClassification']),
    stargazersCount(count) {
      if (count < 1000) {
        return count
      } else {
        return `${(count / 1000).toFixed(1)}k`
      }
    },
    onResize() {
      this.cardHeight = `${window.innerHeight - 64}px`
    },
    changeFilePath(path, event) {
      if (event.target.getAttribute('class') !== 'btn__content') {
        this.setFilePath(path)
      }
    },
    moveToClassification(id) {
      this.moveRepoId = id
      for (let item of this.classification) {
        if (item.repos.some(e => e === id)) {
          this.originClassificationName = this.classificationName = item.name
          break
        }
      }
      this.openMoveClassification = true
    },
    removeFromClassification(id) {
      const t = this.classification.find(e => e.name === this.name)
      t.repos = t.repos.filter(e => e !== id)
      this.setClassification(this.classification)
    },
    cancelMoveClassification() {
      this.openMoveClassification = false
      this.moveRepoId = null
      this.originClassificationName = this.classificationName = null
    },
    saveMoveClassification() {
      if (this.originClassificationName !== this.classificationName) {
        if (this.originClassificationName === null) {
          const t = this.classification.find(e => e.name === this.classificationName)
          t.repos.push(this.moveRepoId)
        } else {
          const origin = this.classification.find(e => e.name === this.originClassificationName)
          origin.repos = origin.repos.filter(e => e !== this.moveRepoId)
          const t = this.classification.find(e => e.name === this.classificationName)
          t.repos.push(this.moveRepoId)
        }
        this.setClassification(this.classification).then(() => {
          this.openMoveClassification = false
          this.moveRepoId = null
          this.originClassificationName = this.classificationName = null
        }).catch(err => {
          console.log(err)
        })
      }
    },
  },
  watch: {
    '$route' (to, from) {
      this.name = to.params.name
      this.searchKeyWords = ''
    }
  },
  mounted() {
    this.onResize()
  },
  created() {
    const { name } = this.$route.params
    this.name = name
    this.setFilePath(null)
  }
}
</script>
<style scoped lang="scss">
#starred-list-card {
  > #starred-list-card-toolbar {
    .spacer {
      -webkit-box-flex: .1 !important;
      // -ms-flex-positive: .5 !important;
      flex-grow: .1 !important;
    }
  }
}
</style>