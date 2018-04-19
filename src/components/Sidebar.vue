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
        <v-btn fab small color="pink" top left absolute dark @click="setClassificationDialog = true">
          <v-icon>add</v-icon>
        </v-btn>
        <v-dialog v-model="setClassificationDialog" max-width="350" persistent>
          <v-progress-circular indeterminate :size="70" :width="7" :style="loadingStyle"
                               v-show="setClassificationLoading" color="purple"></v-progress-circular>
          <v-card v-if="!storageRepoName">
            <v-card-title>
              <span class="headline">{{ $t('message.sidebar.setStorageRepoName') }}</span>
            </v-card-title>
            <v-card-text>
              <v-text-field v-model="storageRepoNameInput"
                            :placeholder="$t('message.sidebar.defaultStorageRepoName')"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="cancelStorageRepoName()">
                {{ $t('message.cancel') }}
              </v-btn>
              <v-btn color="blue darken-1" flat @click.native="saveStorageRepoName()">
                {{ $t('message.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-else>
            <v-card-title>
              <span class="headline">{{ $t('message.sidebar.setClassificationName') }}</span>
            </v-card-title>
            <v-text-field v-model="classificationNameInput" :rules="[rules.checkClassificationName]"></v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="cancelClassification()">
                {{ $t('message.cancel') }}
              </v-btn>
              <v-btn color="blue darken-1" flat @click.native="saveClassification()">
                {{ $t('message.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-list class="pb-0">
          <v-list-group v-model="starredActive" prepend-icon="star" no-action>
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('message.sidebar.starredRepos') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(language, index) in languages" :key="index" :to="{name: 'Origin', params: {language: language || 'Unknown'}}">
              <v-list-tile-content>
                <v-list-tile-title>{{ language === null ? "Unknown" : language }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action class="pr-1 grey--text">{{ getStarredReposCount(language) }}</v-list-tile-action>
            </v-list-tile>
          </v-list-group>
          <v-list-group v-model="customActive" prepend-icon="library_books" no-action>
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>{{ $t('message.sidebar.classification') }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="(item, index) in classification" :key="index" @click="routeToCustomList(item, $event)">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action class="pr-1 grey--text">
                <v-menu bottom left>
                  <v-btn icon slot="activator">
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                  <v-list>
                    <v-list-tile @click.prevent.stop="renameClassification(item)">
                      <v-list-tile-content>
                        <v-list-tile-title>{{ $t('message.sidebar.renameClassification') }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile @click.prevent.stop="removeClassification(item)">
                      <v-list-tile-content>
                        <v-list-tile-title>{{ $t('message.sidebar.removeClassification') }}</v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-group>
        </v-list>
      </v-card-text>
      <v-alert type="error" :value="storageRepoNameExisted" transition="scale-transition" :style="alertStyle">
        {{ $t('message.sidebar.storageRepoNameExisted') }}
      </v-alert>
      <v-dialog v-model="openRenameDialog" max-width="350" persistent>
        <v-card>
          <v-card-text>
            <v-text-field v-model="targetClassificationNameInput"
                          :rules="[rules.checkClassificationRename]"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="cancelRenameClassification">
              {{ $t('message.cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click.native="saveRenameClassification">
              {{ $t('message.ok') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="openRemoveDialog" max-width="350" persistent>
        <v-card>
          <v-card-title>{{ $t('message.removeClassificationQues') }}</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="cancelRemoveClassification">
              {{ $t('message.cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click.native="saveRemoveClassification">
              {{ $t('message.ok') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-navigation-drawer>
</template>
<script>
import sideBarHeaderIcon from '../assets/sidebarheader.jpg'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'Sidebar',
  props: {
    drawer: {
      type: Boolean,
      required: true,
      default: true,
    }
  },
  data() {
    return {
      sideBarHeaderIcon,
      alertStyle: {
        position: 'fixed',
        'z-index': 100,
        top: '20px',
        left: '50%',
        width: '400px',
        marginLeft: '-200px'
      },
      starredActive: false,
      customActive: false,
      storageRepoNameInput: null,
      storageRepoNameExisted: false,
      classificationNameInput: null,
      setClassificationDialog: false,
      setClassificationLoading: false,
      storageRepoName: null,
      rules: {
        checkClassificationName: (value) => {
          return this.classification.every(e => e.name !== value) ||
            this.$t('message.sidebar.invalidClassificationName')
        },
        checkClassificationRename: (value) => {
          const name = this.targetClassification ? this.targetClassification.name : null
          return this.classification.filter(e => e.name !== name)
            .every(e => e.name !== value) || this.$t('message.sidebar.invalidClassificationName')
        }
      },
      openRemoveDialog: false,
      openRenameDialog: false,
      targetClassification: null,
      targetClassificationNameInput: null,
    }
  },
  computed: {
    ...mapState({
      user: ({ user }) => user.user,
      starredRepos: ({ github }) => github.starredRepos,
      s: ({ github }) => github.storageRepoName,
      classification: ({ github }) => github.classification,
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
    ...mapActions(['setStorageRepoName', 'addClassification', 'setClassification']),
    routeToCustomList(item, event) {
      if (event.target.getAttribute('class') !== 'btn__content') {
        this.$router.push({
          name: 'Custom',
          params: {
            name: item.name
          }
        })
      }
    },
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
    },
    cancelClassification() {
      this.classificationNameInput = this.storageRepoName
      this.setClassificationDialog = false
    },
    saveClassification() {
      if (this.classificationNameInput) {
        this.setClassificationLoading = true
        this.addClassification(this.classificationNameInput).then(() => {
          this.setClassificationLoading = false
          this.setClassificationDialog = false
          this.classificationNameInput = null
        }).catch(err => {
          this.setClassificationLoading = false
          this.setClassificationDialog = false
          this.classificationNameInput = null
          console.log(err)
        })
      }
    },
    cancelStorageRepoName() {
      this.storageRepoNameInput = this.storageRepoName
      this.setClassificationDialog = false
    },
    saveStorageRepoName() {
      const repoName = !this.storageRepoNameInput ? 'starsManagerRepo' : this.storageRepoNameInput
      this.setClassificationLoading = true
      this.setStorageRepoName(repoName).then(() => {
        this.setClassificationLoading = false
        this.setClassificationDialog = false
        this.storageRepoName = repoName
      }).catch(err => {
        this.setClassificationLoading = false
        this.setClassificationDialog = false
        if (err === 'not empty') {
          this.storageRepoNameExisted = true
          setTimeout(() => {
            this.storageRepoNameExisted = false
          }, 4000)
        }
      })
    },
    renameClassification(item) {
      this.targetClassification = item
      this.targetClassificationNameInput = item.name
      this.openRenameDialog = true
    },
    cancelRenameClassification() {
      this.targetClassification = null
      this.targetClassificationNameInput = null
      this.openRenameDialog = false
    },
    saveRenameClassification() {
      const t = this.classification.find(e => e.name === this.targetClassification.name)
      t.name = this.targetClassificationNameInput
      this.setClassification(this.classification).then(() => {
        this.openRenameDialog = false
        this.targetClassification = null
        this.targetClassificationNameInput = null
      }).catch(err => {
        console.log(err)
      })
    },
    removeClassification(item) {
      this.targetClassification = item
      this.openRemoveDialog = true
    },
    cancelRemoveClassification() {
      this.targetClassification = null
      this.openRemoveDialog = false
    },
    saveRemoveClassification() {
      const { name } = this.targetClassification
      this.setClassification(this.classification.filter(e => e.name !== name)).then(() => {
        this.targetClassification = null
        this.openRemoveDialog = false
      }).catch(err => {
        console.log(err)
      })
    }
  },
  watch: {
    drawer(newValue) {
      this.$emit('update:drawer', newValue)
    },
    storageRepoName(newValue) {
      this.storageRepoNameInput = newValue
    }
  },
  created() {
    this.storageRepoNameInput = this.storageRepoName = this.s
  }
}
</script>
<style scoped>
/*.list__group__header__prepend-icon {
  padding-right: 8px;
  padding-left: 24px;
}*/
</style>