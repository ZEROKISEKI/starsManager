<template>
  <v-app>
    <v-progress-linear class="ma-0" :indeterminate="true"
                       :active="loading" :query="false" v-show="loading"></v-progress-linear>
    <template v-if="!loading">
      <side-bar :drawer.sync="drawer"></side-bar>
      <v-toolbar app color="blue-grey" dark flat>
        <v-toolbar-side-icon @click.stop="drawer = !drawer">
          <v-icon v-if="drawer">arrow_back</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title v-show="owner && repo">{{ owner }}/{{ repo }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip left>
          <v-btn icon @click="clearCache()" slot="activator">
            <v-icon>delete</v-icon>
          </v-btn>
          <span>{{ $t('message.clearCache') }}</span>
        </v-tooltip>
        <!--<v-btn icon @click="openSettingsWindow()">
          <v-icon>settings</v-icon>
        </v-btn>-->
        <v-btn icon @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <v-menu bottom left>
          <v-btn icon slot="activator" dark>
            <v-icon>more_vert</v-icon>
          </v-btn>
          <!-- TODO add other operation, like music 163 -->
        </v-menu>
      </v-toolbar>
      <v-content>
        <v-container fluid fill-height class="pa-0">
          <v-layout style="max-width: 100%;">
            <v-flex row style="max-width: 100%;">
              <router-view></router-view>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
      <!--<v-dialog fullscreen :overlay="false" v-model="openSettings"
                scrollable
                transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar card dark color="primary">
            <v-btn icon dark @click.native="openSettings = false">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ $t('message.settings.title') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click.native="">{{ $t('message.settings.save') }}</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-btn color="primary" dark @click.stop="clearCache()">{{ $t('message.clearCache') }}</v-btn>
            <v-list three-line v-if="settings.storageRepo">
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.settings.storageRepo.name') }}</v-list-tile-title>
                  <v-text-field v-model="settings.storageRepo.name"></v-text-field>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.settings.storageRepo.default') }}</v-list-tile-title>
                  <v-text-field disabled v-model="settings.storageRepo.path.default"></v-text-field>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.settings.storageRepo.custom') }}</v-list-tile-title>
                  <v-text-field v-model="settings.storageRepo.path.custom"></v-text-field>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <v-list three-line v-if="settings.cloneRepoPath">
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.settings.cloneRepoPath.default') }}</v-list-tile-title>
                  <v-text-field disabled v-model="settings.cloneRepoPath.default"></v-text-field>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ $t('message.settings.cloneRepoPath.custom') }}</v-list-tile-title>
                  <v-text-field v-model="settings.cloneRepoPath.custom"></v-text-field>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
          <div style="flex: 1 1 auto;"></div>
        </v-card>
        <v-progress-circular indeterminate :size="70" :width="7"
                             v-show="settingsLoading" color="purple"></v-progress-circular>
        <v-alert type="success" :value="cacheCleared"  :style="cacheClearStatusStyle"
                 transition="scale-transition" dismissible>
          {{ $t('message.clearCacheSuccess') }}
        </v-alert>
        <v-alert type="error" :value="cacheClearedFailed" :style="cacheClearStatusStyle"
                 transition="scale-transition" dismissible>
          {{ $t('message.clearCacheFailed') }}
        </v-alert>
      </v-dialog>-->
    </template>
    <v-alert type="error" :value="offline" transition="scale-transition" :style="alertStyle">
      {{ $t('message.offline') }}
    </v-alert>
    <v-alert type="success" :value="cacheCleared"  :style="alertStyle"
             transition="scale-transition" dismissible>
      {{ $t('message.clearCacheSuccess') }}
    </v-alert>
    <v-alert type="error" :value="cacheClearedFailed" :style="alertStyle"
             transition="scale-transition" dismissible>
      {{ $t('message.clearCacheFailed') }}
    </v-alert>
  </v-app>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import SideBar from './Sidebar.vue'
export default {
  name: "Main",
  components: {
    SideBar
  },
  data() {
    return {
      drawer: true,
      openSettings: false,
      alertStyle: {
        position: 'fixed',
        'z-index': 100,
        top: '20px',
        left: '50%',
        width: '400px',
        marginLeft: '-200px'
      },
      cacheCleared: false,
      cacheClearedFailed: false,
    }
  },
  computed: {
    ...mapState({
      offline: ({ common }) => common.offline,
      loading: ({ common }) => common.loading,
      owner: ({ github }) => github.owner,
      repo: ({ github }) => github.repo,
      settingsLoading: ({ common }) => common.settingsLoading,
      settings({ common }) {
        return JSON.parse(JSON.stringify(common.settings)) || {
          storageRepo: {
            path: {}
          },
          cloneRepoPath: {}
        }
      },
    }),

  },
  methods: {
    ...mapActions(['getUser', 'getUserStarredRepos', 'removeAccessToken', 'loadingStill',
      'loadingComplete', 'settingsLoadingStill', 'settingsLoadingComplete',
      'setOnline', 'setOffline', 'clearDBCache', 'getSettings']),
    logout() {
      this.removeAccessToken()
      this.$router.push({
        name: 'Login',
        path: '/login'
      })
    },
    clearCache() {
      this.clearDBCache().then(() => {
        this.cacheCleared = true
        setTimeout(() => {
          this.cacheCleared = false
        }, 4000)
      }).catch(err => {
        console.log(err)
        this.cacheClearedFailed = true
        setTimeout(() => {
          this.cacheCleared = false
        }, 4000)
      })
    },
    openSettingsWindow() {
      astilectron.sendMessage({ "name": "GetSettingsFile" }, message => {
        if (message.name === 'GetSettingsFile.callback') {
          // const payload = JSON.stringify(message.payload)
          this.getSettings(message.payload)
          this.openSettings = true
        }
      })
    },
    saveSettingsFile() {
      astilectron.sendMessage({ "name": "SaveSettingsFile", "payload": this.settings }, message => {
        if (message.name === 'SaveSettingsFile.callback') {
          this.getSettings(this.settings)
          this.openSettings = false
        }
      })
    }
  },
  created() {
    this.loadingStill()
    Promise.all([this.getUser(), this.getUserStarredRepos()]).then(() => {
      this.loadingComplete()
    }).catch(err => {
      this.loadingComplete()
      this.setOffline()
    })
  }
}
</script>
<style scoped lang="scss">
// @import "../styles/motion.scss";

</style>