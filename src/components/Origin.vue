<template>
  <v-container fluid class="mx-0 pa-0">
    <v-layout rowp>
      <v-flex md4 lg4 xl4 style="flex-basis: auto; -webkit-flex-basis: auto;">
        <v-card id="starred-list-card" style="position: relative; overflow: auto; max-width: 400px;"
                v-resize="onResize" :height="cardHeight">
          <v-toolbar color="indigo" id="starred-list-card-toolbar"
                     dark absolute scroll-off-screen scroll-target="#scrolling-techniques">
            <v-toolbar-title>{{ language }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field :label="$t('message.starredList.search')" color="white" :key="language"
                          single-line append-icon="search" hide-details v-model="searchKeyWords"></v-text-field>
            <v-menu bottom left>
              <v-btn icon slot="activator" dark>
                <v-icon>more_vert</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile key="starredDate" @click="sortWay = null">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('message.starredList.sortWays.starredDate') }}</v-list-tile-title>
                  </v-list-tile-content>
                  <template v-if="sortWay === null">
                    <v-list-tile-action><v-icon>done</v-icon></v-list-tile-action>
                  </template>
                </v-list-tile>
                <v-list-tile key="stargazersCount" @click="sortWay = 'created_at'">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('message.starredList.sortWays.createdDate') }}</v-list-tile-title>
                  </v-list-tile-content>
                  <template v-if="sortWay === 'created_at'">
                    <v-list-tile-action><v-icon>done</v-icon></v-list-tile-action>
                  </template>
                </v-list-tile>
                <v-list-tile key="createdDate" @click="sortWay = 'stargazers_count'">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ $t('message.starredList.sortWays.stargazersCount') }}</v-list-tile-title>
                  </v-list-tile-content>
                  <template v-if="sortWay === 'stargazers_count'">
                    <v-list-tile-action><v-icon>done</v-icon></v-list-tile-action>
                  </template>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-toolbar>
          <v-list three-line class="scroll-y" id="scrolling-techniques" style="max-height:100%; padding-top: 64px;">
            <template v-for="(repo, index) in searchStarredRepos">
              <v-list-tile :key="repo.id" avatar @click="filePath = repo.full_name">
                <v-list-tile-content>
                  <v-list-tile-title>{{ repo.full_name }}</v-list-tile-title>
                  <v-list-tile-sub-title class="text--primary">{{ repo.description }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action class="py-3">
                  <v-list-tile-action-text>{{ stargazersCount(repo.stargazers_count) }} stars</v-list-tile-action-text>
                  <v-btn icon>
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider v-if="index + 1 < starredRepos.length" :key="index"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex md8 lg8 xl8 style="max-width: 100%; flex-grow: 1; -webkit-flex-grow: 1; overflow-x: auto;">
        <file v-if="filePath !== null" :file-path="filePath" :height="cardHeight"></file>
        <!-- TODO 增加空白页面 -->
        <empty v-else></empty>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapState } from 'vuex'
import File from './File.vue'
import Empty from './Empty.vue'
export default {
  name: "Origin",
  data() {
    return {
      language: 'All',
      cardHeight: 'auto',
      searchKeyWords: '',
      sortWay: null,
      filePath: null,
    }
  },
  components: {
    File,
    Empty
  },
  computed: {
    ...mapState({
      starredRepos({ github }) {
        if(this.language === 'All') {
          return github.starredRepos
        } else if(this.language === 'Unknown') {
          return github.starredRepos.filter(repo => repo.language === null)
        } else {
          return github.starredRepos.filter(repo => repo.language === this.language)
        }
      }
    }),
    keywords() {
      return new RegExp(this.searchKeyWords, 'i')
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
    }
  },
  methods: {
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
  },
  watch: {
    '$route' (to, from) {
      this.language = to.params.language
    }
  },
  mounted() {
    this.onResize()
  },
  created() {
    const { language = 'All' } = this.$route.params
    this.language = language
  }
}
</script>
<style lang="scss" scoped>
#starred-list-card {
  > #starred-list-card-toolbar {
    .spacer {
      -webkit-box-flex: .5 !important;
      // -ms-flex-positive: .5 !important;
      flex-grow: .5 !important;
    }
  }
}
</style>