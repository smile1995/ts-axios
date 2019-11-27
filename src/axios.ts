import { AxiosInstance, AxiosRequestConfig } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'

// 工厂函数 - 混合对象实现
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)// 实例化 Axios 对象
  const instance = Axios.prototype.request.bind(context)// 函数

  // 将 context 的实例属性和原型属性全部拷贝到 instance 上
  extend(instance, context)

  // 类型断言
  return instance as AxiosInstance
}

const axios = createInstance(defaults)

export default axios
