import { deepMerge, isPlainObject } from './util'
import { Method } from '../types'

// 规范 headers 参数
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) return
  Object.keys(headers).forEach(name => {
    // headers[name] 不等于 normalizedName，但是转换为大写相等
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]// headers[name] 的值赋值给 headers[normalizedName]
      delete headers[name]// 删除 headers[name]
    }
  })
}

// 处理请求 header
export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {// 是否为普通对象
    if (headers && !headers['Content-Type']) {// 没有配置 Content-Type 的时候
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

// 处理响应 header
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) return parsed
  headers.split('\r\n').forEach(line => {
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) return
    if (val) val = val.trim()
    parsed[key] = val
  })
  return parsed
}

// 剔除 header 中不需要的属性
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) return headers

  headers = deepMerge(headers.common, headers[method], headers)


  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
