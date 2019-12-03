import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
  protocol: string
  host: string
}

// 编码转换
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

// 判断 url 地址是否是绝对地址
export function isAbsoluteURL(url: string): boolean {
  return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

// 辅助函数（拼接请求地址 url）
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

// url 地址拼接
export function buildURL(
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => string
): string {
  if (!params) return url

  let serializedParams

  if (paramsSerializer) {
    // 判断是否自定义参数系列化规则
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    // 判断参数是否是 URLSearchParams 类型
    serializedParams = params.toString()
  } else {
    const parts: string[] = []

    Object.keys(params).forEach(key => {
      const val = params[key]
      if (val === null || typeof val === 'undefined') return
      let values = []
      if (Array.isArray(val)) {
        // 是否是数组
        values = val
        key += '[]'
      } else {
        // 不是数组转换为数组
        values = [val]
      }
      values.forEach(val => {
        if (isDate(val)) {
          val = val.toISOString() // Date 转 字符串
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val) // Object 转 字符串
        }
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    serializedParams = parts.join('&') // Array 转 字符串，用 & 隔离
  }
  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) url = url.slice(0, markIndex) // 剔除 url 中的哈希
  }
  url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams // 拼接 url
  return url
}

// 判断是否是同域(同源)请求
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  // 判断传入的 URL 和当前页面的 URL 是否一致
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

const urlParsingNode = document.createElement('a') // 创建一个 a 标签
const currentOrigin = resolveURL(window.location.href) // 当前页面的协议和主机

// 辅助函数（获取协议和主机）
function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode
  return {
    protocol,
    host
  }
}
