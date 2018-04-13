// GitHub文件为图片格式时, headers 设置 accept 为 application/vnd.github.VERSION.full
// GitHub其他的文件格式headers 设置 accept 为 application/vnd.github.VERSION.raw
export const imageType = /\.(gif|jpg|jpeg|tiff|png|bmp|icon|icns)$/i

// 不能解析的格式都过滤掉
export const unknownType = /\.(ar|cpio|shar|iso|lbr|mar|sbx|tar|bz2|gz|lz|rz|sz|xz|7z|afa|apk|dmg|app|jar|rar|xp3|zip|exe|msi)$/i