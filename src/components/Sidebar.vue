<template>
  <v-navigation-drawer app v-model="drawer" floating>
    <v-card flat height="100%">
      <v-card-media height="auto" :src="sideBarHeaderIcon">
        <v-list two-line>
          <v-list-tile avatar>
            <v-list-tile-avatar size=60 color="black">
              <img :src="user.avatar" />
            </v-list-tile-avatar>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{ user.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ user.id }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-media>
      <v-card-text class="px-0 pb-0 pt-4" style="position:relative;">
        <!-- TODO 添加增加自定义分类操作 -->
        <v-btn fab small color="pink" top left absolute dark>
          <v-icon>add</v-icon>
        </v-btn>
        <v-list class="pb-0">
          <v-list-group v-model="starredActive" prepend-icon="star" no-action>
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('message.sidebar.starredRepos') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(language, index) in languages" :key="index" :to="{ name: 'Origin', params: {language: language || 'Unknown'}}">
              <v-list-tile-content>
                <v-list-tile-title>{{ language === null ? "Unknown" : language }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action class="pr-1 grey--text">{{ getStarredReposCount(language) }}</v-list-tile-action>
            </v-list-tile>
          </v-list-group>
          <!-- TODO 添加自定义分类 -->
          <!--<v-list-group v-model="customActive" prepend-icon="library_books" no-action>
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>自定义star集合</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>

            </v-list-tile>
          </v-list-group>-->
        </v-list>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>
<script>
import sideBarHeaderIcon from '../assets/sidebarheader.jpg'
import { mapState } from 'vuex'
export default {
  name: 'Sidebar',
  props: {
    drawer: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  data() {
    return {
      sideBarHeaderIcon,
      starredActive: false,
      customActive: false,
    }
  },
  computed: {
    ...mapState({
      user: ({ user }) => user.user,
      starredRepos: ({ github }) => github.starredRepos,
    }),
    languages() {
      const l = ['All']
      let repo
      while(repo = this.starredRepos.find(repo => l.indexOf(repo.language) === -1)) {
        l.push(repo.language)
      }
      return l.sort()
    }
  },
  methods: {
    getStarredReposCount(l = 'All') {
      if (l === 'All') {
        return this.starredRepos.length
      } else {
        return this.starredRepos.filter(repo => repo.language === l).length
      }
    },
    SelectStarredRepos(language = 'All') {
      if (language === null) {
        language = 'Unknown'
      }
      this.$router.push({
        name: 'Origin',
        params: {
          language
        }
      })
    }
  },
  watch: {
    drawer(newValue) {
      this.$emit('update:drawer', newValue)
    }
  },
  created() {
  }
}
</script>
<style scoped>
/*.list__group__header__prepend-icon {
  padding-right: 8px;
  padding-left: 24px;
}*/
</style>