import { isPlainObject } from './util'

// request 数据转换
export function transformRequest(data: any): any {
  if (isPlainObject(data)) return JSON.stringify(data)
  return data
}

// data 响应数据转换
export function transformResponse(data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      // do nothing
    }
  }
  return data
}
