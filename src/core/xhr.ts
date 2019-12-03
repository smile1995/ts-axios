import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

// 利用 XMLHttpRequest 发送请求
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfHeaderName,
      xsrfCookieName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    // 构造函数
    const request = new XMLHttpRequest()

    // 初始化一个请求
    request.open(method.toUpperCase(), url!, true)

    configureRequest() // 请求配置

    addEvents() // 添加事件函数配置

    processHeaders() // Headers 逻辑处理

    processCancel() // 取消功能 cancel 逻辑处理

    // 发送请求。如果请求是异步的（默认），那么该方法将在请求发送后立即返回
    request.send(data)

    // 辅助函数（请求配置）
    function configureRequest(): void {
      // 判断是否设置返回类型
      if (responseType) request.responseType = responseType

      // 判断是否设置超时时间
      if (timeout) request.timeout = timeout

      // 判断是否跨域
      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    // 辅助函数（添加事件函数配置）
    function addEvents(): void {
      // XMLHttpRequest 的 readyState 属性发生改变时触发
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) {
          // 下载操作是否已完成。
          return
        }

        if (request.status === 0) {
          // 代理被创建，但尚未调用 open() 方法
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

      // 下载进度监控
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      // 上传进度监控（数据类型是 FormData 类型）
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    // 辅助函数（Headers 逻辑处理）
    function processHeaders(): void {
      // 如果请求数据是 FormData 类型，删除 headers.Content-Type 数据，根据请求数据类型自动设置 headers.Content-Type
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // xsrf 防御
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) headers[xsrfHeaderName] = xsrfValue
      }

      // HTTP 授权
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      // 设置 headers
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    // 辅助函数（取消功能 cancel 逻辑处理）
    function processCancel(): void {
      // 取消功能
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort() // 取消请求
          reject(reason)
        })
      }
    }

    // 辅助函数（判断状态码）
    function handleResponse(response: AxiosResponse): void {
      if (!validateStatus || validateStatus(response.status)) {
        // 判断状态码是否合法
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
