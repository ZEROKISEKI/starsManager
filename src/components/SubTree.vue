<template>
  <ul class="sub-tree" v-show="show">
    <li v-for="item in children" :style="{ paddingLeft: item.type === 'tree' ? '0' : '20px' }">
      <template>
        <a @click="clickTree(item)">
          <v-icon v-if="item.type === 'tree' && item.open === false" small>chevron_right</v-icon>
          <v-icon v-else-if="item.type === 'tree' && item.open === true" small>expand_more</v-icon>
          <v-icon v-if="item.type === 'tree'" small>folder</v-icon>
          <v-icon v-else small>code</v-icon>
          <span>{{ item.text }}</span>
        </a>
      </template>
      <template v-if="item.type === 'tree'">
        <sub-tree :children="item.children" :owner="owner" :repo="repo" :show="item.open"></sub-tree>
      </template>
    </li>
  </ul>
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: "SubTree",
  props: ['children', 'owner', 'repo', 'show'],
  computed: {
    ...mapState({
      filePath: ({ github }) => github.filePath,
    })
  },
  methods: {
    ...mapActions(['setFilePath']),
    clickTree(item) {
      if (item.type === 'tree') {
        item.open = !item.open
      } else if (item.type === 'blob') {
        this.setFilePath(`${this.owner}/${this.repo}/${item.path}`)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.sub-tree {
  list-style: none;
  padding-left: 16px;
}
</style>