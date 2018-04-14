# starsManager

一款基于vue和go的桌面端管理star项目应用

## 前言:

最开始不怎么玩github的时候, 自己star的repo很少, 倒也没这个需求, 但是后来github的需求逐渐多了
自己star的repo也开始多了, 现在大概有一百多个repo, 有些久了都忘了, 不好管理, 受到Quiver和印象笔记这种类型应用的启发, 于是想写个能够方便自己管理star项目的客户端

之前在github上看到也有个管理stars的项目[gitstars](https://github.com/Monine/gitstars), 不过感觉不是很合我的胃口:(

## 开发状态:

待完成

[ ] 离线支持
[ ] 多台PC共享状态
[ ] 一次生成多平台的文件


## 项目技术栈和主要框架:

Vue全家桶: vue2 + vuex + vue-router
UI框架: vuetify.js(一款渐进式Material Design框架)
前端网络请求: axios
前端数据库: pouchdb
前端构建工具: parcel
桌面支持: go-astilectron(thanks to [asticode](https://github.com/asticode))

## 演示效果:


## 食用方法:

直接下载release对应系统的版本即可

如果需要自己搭建的话, 你的PC需要安装好GoLang

### 前端代码构建:

首先全局安装parcel(如果已经有了, 可以跳过这一步):

```

$ yarn global add parcel-bundler

or 

$ npm install -g parcel-bundler


```

接下来是常规操作:

```

$ cd src
$ yarn or npm install
$ npm run build

```

build之后在`src/dist`上面会出现`index.html`, `src.js`等几个文件, 可以运行go来生成桌面应用了, 你需要先有对应的支持:



```

cd ..
astilectron-bundler -v
go run *.go(或者直接打开项目生成的output里面的应用)

```


## 一些问题:

在天朝可能在electron下载的那一步卡死, 你可以用淘宝源镜像下对应的electron版本


## PS:

如果在项目中有什么问题或者发现了什么bug, 欢迎提交PR或者issue, 如果对本项目感兴趣的话也可以星一波~