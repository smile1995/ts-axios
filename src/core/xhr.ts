import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'

// 利用 XMLHttpRequest 发送请求
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise(((resolve, reject) => {
    const { data = null, url, method = 'get', headers, responseType, timeout } = config

    // 构造函数
    const request = new XMLHttpRequest()

    // 判断是否设置返回类型
    if (responseType) request.responseType = responseType

    // 判断是否设置超时时间
    if (timeout) request.timeout = timeout

    // 初始化一个请求
    request.open(method.toUpperCase(), url!, true)

    // XMLHttpRequest 的 readyState 属性发生改变时触发
    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) {// 下载操作是否已完成。
        return
      }

      if (request.status === 0) {// 代理被创建，但尚未调用 open() 方法
        return
      }

      // 返回所有的响应头，以 CRLF 分割的字符串，或者 null 如果没有收到任何响应。
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      // 根据 responseType 判断 request 的数据
      const responseData = responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }

    // 处理网络错误
    request.onerror = function handleError() {
      reject(createError('Network Error', config, null, request))
    }

    // 超时时触发
    request.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
    }

    // 设置 headers
    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    // 发送请求。如果请求是异步的（默认），那么该方法将在请求发送后立即返回
    request.send(data)

    // 辅助函数（判断状态码）
    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
      }
    }
  }))
}
