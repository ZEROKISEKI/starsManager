<template>
  <v-card id="tree" class="tree">
    <v-card-title primary-title>{{ filePath }}</v-card-title>
    <v-card-text style="overflow: auto">
      <ul v-if="repoTree.data">
        <li v-for="item in repoTree.data['']" :style="{ paddingLeft: item.type === 'tree' ? '0' : '20px' }">
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
      <h3 v-if="treeFailed">{{ $t('message.noTree') }}</h3>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import SubTree from './SubTree.vue'
export default {
  name: "Tree",
  props: {
    repoTree: {
      type: Object,
      required: true
    },
  },
  components: {
    SubTree
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      filePath: ({ github }) => github.filePath,
      treeFailed: ({ common }) => common.treeFailed,
    }),
    owner() {
      return this.repoTree.owner
    },
    repo() {
      return this.repoTree.repo
    },
  },
  methods: {
    ...mapActions(['setFilePath']),
    clickTree(item) {
      if (item.type === 'tree') {
        item.open = !item.open
      } else if (item.type === 'blob') {
        this.setFilePath(`${this.owner}/${this.repo}/${item.path}`)
      }
    },
  },
  created() {

  }
}
</script>
<style scoped lang="scss">
#tree {
  ul {
    list-style: none;
  }
}
</style>