import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { flattenHeaders, processHeaders } from '../helpers/headers'
import { transformRequest, transformResponse } from '../helpers/data'

// 入口文件
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)// 先处理参数配置
  return xhr(config).then(res => transformResponseData(res))// 再发请求
}

// config 参数处理
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.headers = transformHeaders(config)
  config.data = transformRequestData(config)
  config.headers = flattenHeaders(config.headers, config.method!)
}

// url 参数处理
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
}

// body 数据参数处理
function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

// headers 数据参数处理
function transformHeaders(config: AxiosRequestConfig): any {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}

// 处理响应 data
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}
