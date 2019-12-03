import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

// 工厂函数 - 混合对象实现
function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config) // 实例化 Axios 对象
  const instance = Axios.prototype.request.bind(context) // 函数

  // 将 context 的实例属性和原型属性全部拷贝到 instance 上
  extend(instance, context)

  // 类型断言
  return instance as AxiosStatic
}

const axios = createInstance(defaults)

// 静态方法
axios.create = function create(config) {
  // 合并默认配置和传入的配置
  return createInstance(mergeConfig(defaults, config))
}

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function warp(arr) {
    return callback.apply(null, arr)
  }
}

axios.Axios = Axios

export default axios
