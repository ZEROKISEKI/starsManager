import axios from 'axios'

export default function({ method = 'get', url, headers = {}, params = {}, data, baseConfig = {} }) {

  const instance = axios.create(Object.assign({
    baseURL: "https://api.github.com",
    responseType: 'json',
  }, baseConfig))

  const config = {
    method,
    url,
    headers,
    params
  }

  const token = localStorage.getItem('starsManager-access-token') || null

  if (!headers['Authorization'] && token) {
    headers['Authorization'] = `token ${token}`
  }

  if ((method === 'post' || method === 'put') && data) {
    config.data = data
  }

  // see github api HTTP Verbs
  if (method === 'put' && !data) {
    headers['Content-Length'] = 0
  }

  return new Promise((resolve, reject) => {
    instance(config).then(response => {
      resolve(response)
    }, err => {
      reject(err)
    })
  })
}