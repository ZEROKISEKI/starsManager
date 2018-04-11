export function utf8ToBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

// 如果不是用在URI上面, 那么用escape是可以的, URI则用encodeURI
export function base64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}