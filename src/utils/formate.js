// format git tree, 参照https://github.com/buunguyen/octotree

function sort(folder) {
  folder.sort((a, b) => {
    if (a.type === b.type) return a.text === b.text ? 0 : a.text < b.text ? -1 : 1
    return a.type === 'blob' ? 1 : -1
  })

  folder.forEach((item) => {
    if (item.type === 'tree' && item.children !== true && item.children.length > 0) {
      sort(item.children)
    }
  })
  return folder
}

function collapse(folder) {
  return folder.map((item) => {
    if (item.type === 'tree') {
      item.children = collapse(item.children)
      if (item.children.length === 1 && item.children[0].type === 'tree') {
        const onlyChild = item.children[0]
        onlyChild.text = item.text + '/' + onlyChild.text
        return onlyChild
      }
    }
    return item
  })
}

function toggle(folder) {
  folder.forEach(item => {
    if (item.type === 'tree') {
      item.open = false
      toggle(item.children)
    }
  })
  return folder
}

export default function formatTree(tree, owner, repo) {
  const folders = { '': [] }

  const p = new Promise((resolve, reject) => {
    const nextChunk = (iteration = 0) => {
      const CHUNK_SIZE = 300

      for(let i = 0; i < CHUNK_SIZE; i++) {
        const item = tree[iteration * CHUNK_SIZE + i]

        if (item === undefined) {
          resolve(folders)
        }

        const path = item.path
        const type = item.type
        const index = path.lastIndexOf('/')
        const name = path.substring(index + 1)

        item.id = 'starsManager' + path
        item.text = name

        folders[path.substring(0, index)].push(item)

        if (type === 'tree' || type === 'blob') {
          if (type === 'tree') {
            folders[item.path] = item.children = []
          }

          const encodedPath = path.split('/').map(encodeURIComponent).join('/')
          const url = `/${owner}/${repo}/${type}/master/${encodedPath}`
          item.a_attr = {
            href: url,
            'data-download-url': url,
            'data-download-filename': name,
          }
        }
      }

      setTimeout(() => nextChunk(iteration + 1))
    }

    nextChunk()
  })

  return p.then((data) => {
    data[''] = sort(data[''])
    data[''] = collapse(data[''])
    data[''] = toggle(data[''])
    return data
  })
}