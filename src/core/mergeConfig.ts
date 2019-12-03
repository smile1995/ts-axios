import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'

const strats = Object.create(null)

function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') return val2
}

function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    // 判断 val2 是否是一个对象
    return deepMerge(val1, val2) // 深拷贝
  } else if (typeof val2 !== 'undefined') {
    // 判断 val2 是有值的，但不是一个对象
    return val2
  } else if (isPlainObject(val1)) {
    // 判断 val1 是否是一个对象
    return deepMerge(val1) // 深拷贝
  } else {
    return val1
  }
}

const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) config2 = {}

  const config = Object.create(null)

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) mergeField(key)
  }

  // 合并配置方法
  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat // 合并策略函数
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
