<template>
  <v-app>
    <v-jumbotron class="grey lighten-2" height="100%">
      <v-container fill-height>
        <v-layout align-center justify-center>
          <v-flex>
            <h3 class="display-3">{{ $t('message.login.welcome') }}</h3>
            <span class="subheading">{{ $t('message.login.description') }}</span>
            <v-divider class="my-3"></v-divider>
            <div class="title mb-3">{{ $t('message.login.title') }}</div>
            <v-btn large color="primary" @click="login">{{ $t('message.login.submit') }}</v-btn>
            <v-btn v-if="lang !== 'en'" large color="primary" @click="changeLocale('en')">
              {{ $t('message.lang') }}
            </v-btn>
            <v-btn v-else-if="lang !== 'zh'" large color="primary" @click="changeLocale('zh')">
              {{ $t('message.lang') }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>
  </v-app>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  name: "Login",
  data() {
    return {}
  },
  computed: {
    lang() {
      return this.$i18n.locale
    }
  },
  methods: {
    ...mapActions(['setAccessToken']),
    login() {
      // const that = this
      astilectron.onMessage(message => {
        if (message.name === "window.event.will.navigate" ||
          message.name === "window.event.did.get.redirect.request") {
          this.setAccessToken(message.payload.access_token)
          this.$router.push({
            path: '/main',
            name: 'Main'
          })
        }
      })

      astilectron.sendMessage({ "name": "login" }, function (message) {})
    },
    changeLocale(language = 'en') {
      this.$i18n.locale = language
      localStorage.setItem('language', language)
    }
  },
}
</script>
<style scoped>

</style>