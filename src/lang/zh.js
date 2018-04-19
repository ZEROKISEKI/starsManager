export default {
  message: {
    lang: '中文',
    offline: '检测到您连接不上github api, 自动为切换离线版本~',
    noFile: '文件加载失败:(',
    noTree: '项目树结构加载失败:(',
    noImage: '该图片未离线缓存过',
    clearCache: '清除缓存',
    clearCacheSuccess: '清除缓存成功',
    clearCacheFailed: '清除缓存失败:(',
    cancel: '取消',
    ok: '确定',
    login: {
      welcome: '欢迎使用StarsManager!',
      submit: '登录',
      title: '现在使用Github OAuth尝试效果吧~',
      description: 'StarsManager是一个旨在方便github用户管理star项目的客户端, 你可以通过使用StarsManager来' +
      '做诸如分类star, 代码树查看star项目等等事情',
    },
    sidebar: {
      starredRepos: '你star的项目',
      classification: '你的自定义分类',
      setStorageRepoName: '设置存储分类的Repo名称',
      setClassificationName: '设置分类的名称',
      defaultStorageRepoName: '默认repo名称: starsManagerStorage',
      invalidClassificationName: 'ClassificationName已存在',
      storageRepoNameExisted: '当前目录下已存在该名称的文件夹',
      removeClassification: '删除分类',
      renameClassification: '重命名'
    },
    removeClassificationQues: '你确定要删除这个分类?',
    starredList: {
      noList: '没有搜索结果',
      search: '仓库名|用户名',
      sortWays: {
        starredDate: '按star日期排序',
        createdDate: '按创建日期排序',
        stargazersCount: '按star量排序'
      },
      itemOperation: {
        move: '移动到...',
        moveToClassification: '移动到分类',
      }
    },
    settings: {
      title: '设置',
      save: '保存',
      storageRepo: {
        title: '存储分类数据的repo(用于保存及同步)',
        name: '存储分类数据的repo名称',
        default: '默认repo路径',
        custom: '用户自定义repo路径'
      },
      cloneRepoPath: {
        title:'git clone相关设置',
        default: 'git clone默认路径',
        custom: '用户自定义clone路径'
      }
    }
  }
}