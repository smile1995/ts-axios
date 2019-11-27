const toString = Object.prototype.toString// 常见的判断类型的方法

// 判断是否是 Date 类型
export function isDate(val: any): val is Date /* 类型保护 */ {
  return toString.call(val) === '[object Date]'
}

// 判断是否是 object 对象
// export function isObject(val: any): val is Object /* 类型保护 */ {
//   return val !== null && typeof val === 'object'
// }

// 判断是否是普通 object 对象
export function isPlainObject(val: any): val is Object /* 类型保护 */ {
  return toString.call(val) === '[object Object]'
}

/**
 * extend 方法的实现用到了交叉类型，并且用到了类型断言。extend 的最终目的是把 from 里的属性都扩展到 to 中，包括原型上的属性。
 * @param to
 * @param from
 */
export function extend<T, U>(to: T, from: U): T & U /** 交叉类型 */ {
  for (const key in from) {
    // 类型断言
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

/**
 * 深拷贝
 * @param objs
 */
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {// 遍历对象
        const val = obj[key]
        if (isPlainObject(val)) {// 如果对象的值还是对象
          if (isPlainObject(result[key])) {// 判断 result[key] 的值是否存在
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val) // 递归
          }
        } else {
          result[key] = val
        }
      })
    }
  })
  return result
}
