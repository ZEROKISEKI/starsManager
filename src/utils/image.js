export default function (url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.height = img.height;
      canvas.width = img.width;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL())
    }
  })
}