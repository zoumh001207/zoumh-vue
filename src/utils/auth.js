import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

const ExpiresInKey = 'Admin-Expires-In'

export function getToken() {
  const token = Cookies.get(TokenKey)
  
  // 调试信息（仅在开发环境或需要时输出）
  if (process.env.NODE_ENV === 'development') {
    if (!token) {
      console.warn('⚠️ Cookie 中未找到 Token')
    } else {
      // 验证 token 格式
      const dotCount = (token.match(/\./g) || []).length
      if (dotCount !== 2) {
        console.error('❌ Cookie 中的 Token 格式错误:', {
          tokenLength: token.length,
          dotCount: dotCount
        })
      }
    }
  }
  
  return token
}

export function setToken(token) {
  if (!token || token.trim() === '') {
    console.error('❌ 尝试设置空的 Token')
    return false
  }
  
  // 验证 JWT 格式（应该包含 2 个点）
  const dotCount = (token.match(/\./g) || []).length
  if (dotCount !== 2) {
    console.error('❌ Token 格式错误，无法保存:', {
      tokenLength: token.length,
      dotCount: dotCount,
      tokenPreview: token.substring(0, 50) + '...'
    })
    return false
  }
  
  try {
    // 设置 Cookie，添加过期时间（7天）和路径配置
    const result = Cookies.set(TokenKey, token, { 
      expires: 7, // 7天过期
      path: '/'   // 根路径，确保所有页面都能访问
    })
    
    // 验证 Cookie 是否真的保存成功
    const savedToken = Cookies.get(TokenKey)
    if (savedToken === token) {
      console.log('✅ Token 已保存到 Cookie，长度:', token.length)
      console.log('✅ Cookie 验证成功，Token 可以正常读取')
    } else {
      console.error('❌ Cookie 保存验证失败:', {
        saved: savedToken ? savedToken.substring(0, 20) + '...' : 'null',
        expected: token.substring(0, 20) + '...'
      })
    }
    
    return result
  } catch (error) {
    console.error('❌ 保存 Token 到 Cookie 失败:', error)
    return false
  }
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getExpiresIn() {
  return Cookies.get(ExpiresInKey) || -1
}

export function setExpiresIn(time) {
  return Cookies.set(ExpiresInKey, time)
}

export function removeExpiresIn() {
  return Cookies.remove(ExpiresInKey)
}
