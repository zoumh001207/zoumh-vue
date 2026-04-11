import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance
// 是否显示重新登录
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API || '/prod-api',
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  // 间隔时间(ms)，小于此时间视为重复提交
  const interval = (config.headers || {}).interval || 1000
  // 获取 token，确保 token 存在且不为空字符串
  const token = getToken()
  
  // 调试信息：检查 token 状态（仅对需要 token 的请求）
  if (!isToken) {
    if (!token || token.trim() === '') {
      console.error('❌ 请求缺少 Token:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenValue: token || 'null',
        allCookies: document.cookie.substring(0, 200) // 显示前200个字符的 Cookie
      })
      
      // 尝试从 Cookie 直接读取
      const directCookie = document.cookie.split(';').find(c => c.trim().startsWith('Admin-Token='))
      if (directCookie) {
        const directToken = directCookie.split('=')[1]
        console.warn('⚠️ 从 Cookie 直接读取到 Token:', directToken ? directToken.substring(0, 20) + '...' : 'null')
        // 如果直接读取成功，使用这个 token
        if (directToken && directToken.trim() !== '') {
          config.headers['Authorization'] = 'Bearer ' + directToken
          console.log('✅ 使用直接读取的 Token')
          return config
        }
      }
    } else {
      // 验证 token 格式（JWT 应该包含两个点）
      const dotCount = (token.match(/\./g) || []).length
      if (dotCount !== 2) {
        console.error('❌ Token 格式错误:', {
          url: config.url,
          tokenLength: token.length,
          dotCount: dotCount,
          expectedDots: 2,
          tokenPreview: token.substring(0, 50) + '...'
        })
      } else {
        // Token 格式正确，正常设置
        config.headers['Authorization'] = 'Bearer ' + token
        console.log('✅ 请求已携带 Token:', {
          url: config.url,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + '...'
        })
      }
    }
  }
  
  // 如果上面没有设置 Authorization 头，且需要 token，这里设置
  if (!config.headers['Authorization'] && token && token.trim() !== '' && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
      return config
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url                // 请求地址
      const s_data = sessionObj.data              // 请求数据
      const s_time = sessionObj.time              // 请求时间
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交'
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', { confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning' }).then(() => {
          isRelogin.show = false
          useUserStore().logOut().then(() => {
            location.href = '/index'
          })
      }).catch(() => {
        isRelogin.show = false
      })
    }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      // 显示后端返回的具体错误信息（如果有）
      const detailMsg = res.data.msg || res.data.message || msg
      ElMessage({ 
        message: detailMsg, 
        type: 'error',
        duration: 8 * 1000, // 延长显示时间
        showClose: true
      })
      console.error('服务器500错误详情:', res.data)
      return Promise.reject(new Error(detailMsg))
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    // 输出详细错误信息到控制台，方便调试
    console.error('请求错误详情:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    let { message } = error
    let errorMsg = ''
    let errorCodeValue = null
    
    // 如果服务器返回了响应数据，尝试解析错误信息
    if (error.response && error.response.data) {
      const responseData = error.response.data
      
      // 如果响应数据是对象且有code字段，使用统一的错误处理
      if (typeof responseData === 'object' && responseData !== null && responseData.code) {
        errorCodeValue = responseData.code
        // 优先使用后端返回的具体错误消息，如果没有则使用错误码对应的消息
        errorMsg = responseData.msg || errorCode[responseData.code] || errorCode['default']
        
        // 如果是500错误，显示更详细的信息
        if (responseData.code === 500) {
          // 显示后端返回的具体错误信息（如果有）
          const detailMsg = responseData.msg || responseData.message || '内部服务器错误'
          ElMessage({ 
            message: detailMsg, 
            type: 'error',
            duration: 8 * 1000, // 延长显示时间，方便查看
            showClose: true
          })
          console.error('服务器错误详情:', responseData)
        } else {
          ElMessage({ message: errorMsg, type: 'error', duration: 5 * 1000 })
        }
        return Promise.reject(new Error(errorMsg))
      }
      
      // 如果是字符串类型的响应数据
      if (typeof responseData === 'string') {
        try {
          const parsed = JSON.parse(responseData)
          if (parsed.code) {
            errorCodeValue = parsed.code
            errorMsg = parsed.msg || errorCode[parsed.code] || errorCode['default']
            ElMessage({ message: errorMsg, type: 'error', duration: 5 * 1000 })
            return Promise.reject(new Error(errorMsg))
          }
        } catch (e) {
          // 解析失败，继续使用默认处理
        }
      }
      
      // 如果响应状态码是500，但没有标准的错误格式
      if (error.response.status === 500) {
        errorMsg = responseData.msg || responseData.message || '内部服务器错误'
        ElMessage({ 
          message: errorMsg, 
          type: 'error',
          duration: 8 * 1000,
          showClose: true
        })
        console.error('500错误详情:', responseData)
        return Promise.reject(new Error(errorMsg))
      }
    }
    
    // 处理网络错误和其他错误
    if (message == "Network Error") {
      errorMsg = "后端接口连接异常，请检查网络连接或后端服务是否正常运行"
    } else if (message.includes("timeout")) {
      errorMsg = "系统接口请求超时，请稍后重试"
    } else if (message.includes("Request failed with status code")) {
      const statusCode = error.response?.status || parseInt(message.slice(-3))
      if (statusCode === 500) {
        errorMsg = "内部服务器错误，请查看控制台获取详细信息"
      } else {
        errorMsg = "系统接口" + statusCode + "异常"
      }
    } else if (!errorMsg) {
      errorMsg = message || "请求失败，请稍后重试"
    }
    
    ElMessage({ message: errorMsg, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data)
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text()
      const rspObj = JSON.parse(resText)
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg)
    }
    downloadLoadingInstance.close()
  }).catch((r) => {
    console.error(r)
    ElMessage.error('下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close()
  })
}

export default service
