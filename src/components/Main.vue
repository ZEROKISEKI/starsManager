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
        <v-spacer></v-spacer>
        <!-- TODO 设置页面设置config.ini -->
        <v-btn icon @click="">
          <v-icon>settings</v-icon>
        </v-btn>
        <v-btn icon @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <!-- TODO 增加操作() -->
        <v-btn icon @click="">
          <v-icon>more_vert</v-icon>
        </v-btn>
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
    </template>
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
      drawer: true
    }
  },
  computed: {
    ...mapState({
      loading: ({ common }) => common.loading
    })
  },
  methods: {
    ...mapActions(['getUser', 'getUserStarredRepos', 'removeAccessToken', 'loadingStill', 'loadingComplete']),
    logout() {
      this.removeAccessToken()
      this.$router.push({
        name: 'Login',
        path: '/login'
      })
    }
  },
  created() {
    this.loadingStill()
    Promise.all([this.getUser(), this.getUserStarredRepos()]).then(() => {
      this.loadingComplete()
    }).catch(err => console.log(err))
  }
}
</script>
<style scoped lang="scss">
// @import "../styles/motion.scss";

</style>