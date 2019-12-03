import { AxiosTransformer } from '../types'

// 请求数据和响应数据转换函数
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  // 判断是否要数据转换，不转换直接返回 data
  if (!fns) return data
  // 强制转换 fns 为数组
  if (!Array.isArray(fns)) fns = [fns]
  // 遍历转换函数
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  return data
}
