import router from '@/router'
import { ElMessageBox, } from 'element-plus'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      nickName: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid).then(res => {
            console.log('登录响应数据:', res)
            let data = res.data
            
            // 检查可能的 token 字段名
            let token = null
            if (data) {
              // 根据后端 TokenService.createToken() 方法，返回的字段是 access_token
              // 尝试多种可能的字段名（优先使用 access_token）
              token = data.access_token || data.token || data.accessToken
              
              // 如果没有找到，打印所有字段以便调试
              if (!token) {
                console.error('❌ 未找到 token 字段')
                console.warn('响应数据字段:', Object.keys(data))
                console.warn('完整响应数据:', JSON.stringify(data, null, 2))
              } else {
                console.log('✅ 找到 token 字段:', token ? 'access_token' : (data.token ? 'token' : 'accessToken'))
              }
            } else {
              console.error('❌ 响应数据为空:', res)
            }
            
            // 确保 token 存在且有效
            if (token && token.trim() !== '') {
              // 验证 token 格式（JWT 应该包含两个点）
              const dotCount = (token.match(/\./g) || []).length
              if (dotCount !== 2) {
                console.error('❌ Token 格式错误:', {
                  tokenLength: token.length,
                  dotCount: dotCount,
                  tokenPreview: token.substring(0, 50) + '...'
                })
                reject(new Error('登录失败：获取到的令牌格式不正确'))
                return
              }
              
              console.log('✅ Token 保存成功，长度:', token.length)
              setToken(token)
              this.token = token
              resolve()
            } else {
              console.error('❌ 登录失败：未获取到有效的访问令牌')
              reject(new Error('登录失败：未获取到有效的访问令牌'))
            }
          }).catch(error => {
            console.error('登录请求失败:', error)
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (isEmpty(user.avatar)) ? defAva : user.avatar
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.nickName = user.nickName
            this.avatar = avatar
            /* 初始密码提示 */
            if(res.isDefaultModifyPwd) {
              ElMessageBox.confirm('您的密码还是初始密码，请修改密码！',  '安全提示', {  confirmButtonText: '确定',  cancelButtonText: '取消',  type: 'warning' }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => {})
            }
            /* 过期密码提示 */
            if(!res.isDefaultModifyPwd && res.isPasswordExpired) {
              ElMessageBox.confirm('您的密码已过期，请尽快修改密码！',  '安全提示', {  confirmButtonText: '确定',  cancelButtonText: '取消',  type: 'warning' }).then(() => {
                router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
              }).catch(() => {})
            }
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
