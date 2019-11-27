import { isDate, isPlainObject } from './util'

// 编码转换
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/ig, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/ig, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/ig, '[')
    .replace(/%5D/ig, ']')
}

// url 地址拼接
export function buildURL(url: string, params?: any): string {
  if (!params) return url

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    const val = params[key]
    if (val === null || typeof val === 'undefined') return
    let values = []
    if (Array.isArray(val)) {// 是否是数组
      values = val
      key += '[]'
    } else {// 不是数组转换为数组
      values = [val]
    }
    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()// Date 转 字符串
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)// Object 转 字符串
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')// Array 转 字符串，用 & 隔离
  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) url = url.slice(0, markIndex)// 剔除 url 中的哈希
  }
  url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams// 拼接 url
  return url
}
