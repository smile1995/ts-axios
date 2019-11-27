import { ResolvedFn, RejectedFn } from '../types'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

// 拦截器的实现
export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = []
  }

  // 添加拦截器方法
  use(resolved: ResolvedFn<T>, rejected: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
  }

  // 用于外部访问拦截器
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    // 遍历 interceptors 拿到每一个拦截器
    this.interceptors.forEach(interceptor => {
      // 如果当前拦截器没有删除，则执行这个函数
      if (interceptor !== null) fn(interceptor)
    })
  }

  // 删除拦截器方法
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
