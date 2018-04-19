export default {
  message: {
    lang: 'English',
    offline: 'connect github api failed, check out offline mode automatically',
    noFile: 'file loading error:(',
    noTree: 'tree loading error:(',
    noImage: 'this image do not cached offline',
    clearCache: 'clear cache',
    clearCacheSuccess: 'clear cache success',
    clearCacheFailed: 'clear cache failed',
    cancel: 'cancel',
    ok: 'ok',
    login: {
      welcome: 'Welcome to use StarsManager!',
      submit: 'login',
      title: 'Now submit by using Github OAuth to check out it~',
      description: 'StarsManager is a desktop tool aim to help users manage theie starred repos.'
    },
    sidebar: {
      starredRepos: 'Your Starred Repos',
      classification: 'Your Classification',
      setStorageRepoName: 'set storage classification repo name',
      setClassificationName: 'set classification name',
      defaultStorageRepoName: 'default repo name: starsManagerStorage',
      invalidClassificationName: 'invalidClassificationName',
      storageRepoNameExisted: 'storage repo name directory already existed in current directory',
      removeClassification: 'delete',
      renameClassification: 'rename',
    },
    removeClassificationQues: 'Are you sure to delete the classification?',
    starredList: {
      noList: 'No Results',
      search: 'repo|user name',
      sortWays: {
        starredDate: 'sort by starred',
        createdDate: 'sort by created',
        stargazersCount: 'sort by stars'
      },
      itemOperation: {
        move: 'move to...',
        moveToClassification: 'moveToClassification',
      }
    },
    settings: {
      title: 'Settings',
      save: 'save',
      storageRepo: {
        title: 'the repo that save your classification',
        name: 'repo name',
        default: 'default repo path',
        custom: 'custom repo path'
      },
      cloneRepoPath: {
        title: 'settings that you use starsManager to git clone',
        default: 'default git clone path',
        custom: 'custom git clone path'
      }
    }
  }
}