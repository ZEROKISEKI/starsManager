<template>
  <router-view></router-view>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  name: 'App',
  methods: {
    ...mapActions(['getSettings'])
  },
  created() {
  }
}
</script>
<style scoped>

</style>