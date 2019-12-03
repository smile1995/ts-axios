import { Canceler, CancelExecutor, CancelTokenSource } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

// CancelToken 取消功能实现
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  // 构造函数
  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    // 实例化 Promise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    // 执行函数
    executor(message => {
      if (this.reason) return // 防止函数多次调用
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  // 抛出异常方法
  throwIfRequested() {
    // 如果 reason 存在值，说明已经调用，抛出异常
    if (this.reason) throw this.reason
  }

  // 静态方法
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
