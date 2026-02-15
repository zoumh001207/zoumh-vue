# JWT Token 错误修复说明

## 🔍 问题分析

根据后端网关日志，出现以下错误：
```
[网关异常处理]请求路径:/system/menu/getRouters,异常信息:JWT strings must contain exactly 2 period characters. Found: 0
```

**问题原因：**
1. 前端在发送请求时，如果 Token 为空或无效，仍然会发送 `Authorization: Bearer ` 或 `Authorization: Bearer undefined`
2. 网关尝试解析这个无效的 JWT token 时失败
3. 导致接口请求被拒绝

## ✅ 修复内容

### 1. 修复请求拦截器 (`src/utils/request.js`)

**修复前：**
```javascript
if (getToken() && !isToken) {
  config.headers['Authorization'] = 'Bearer ' + getToken()
}
```

**修复后：**
```javascript
const token = getToken()
if (token && token.trim() !== '' && !isToken) {
  config.headers['Authorization'] = 'Bearer ' + token
}
```

**改进点：**
- 增加了 token 非空检查
- 确保 token 不是空字符串
- 避免发送无效的 Authorization 头

### 2. 修复登录逻辑 (`src/store/modules/user.js`)

**修复前：**
```javascript
login(username, password, code, uuid).then(res => {
  let data = res.data
  setToken(data.access_token)
  this.token = data.access_token
  resolve()
})
```

**修复后：**
```javascript
login(username, password, code, uuid).then(res => {
  let data = res.data
  // 确保 access_token 存在且有效
  if (data && data.access_token && data.access_token.trim() !== '') {
    setToken(data.access_token)
    this.token = data.access_token
    resolve()
  } else {
    reject(new Error('登录失败：未获取到有效的访问令牌'))
  }
})
```

**改进点：**
- 验证登录返回的 token 是否有效
- 如果 token 无效，拒绝登录并提示错误

### 3. 修复文件上传组件 (`src/components/FileUpload/index.vue`)

**修复前：**
```javascript
const headers = ref({ Authorization: "Bearer " + getToken() })
```

**修复后：**
```javascript
const headers = computed(() => {
  const token = getToken()
  return token && token.trim() !== '' ? { Authorization: "Bearer " + token } : {}
})
```

**改进点：**
- 使用 `computed` 动态计算 headers
- Token 为空时不添加 Authorization 头
- Token 变化时自动更新

### 4. 修复富文本编辑器组件 (`src/components/Editor/index.vue`)

**修复前：**
```javascript
const headers = ref({
  Authorization: "Bearer " + getToken()
})
```

**修复后：**
```javascript
const headers = computed(() => {
  const token = getToken()
  return token && token.trim() !== '' ? { Authorization: "Bearer " + token } : {}
})
```

### 5. 修复图片上传组件 (`src/components/ImageUpload/index.vue`)

**修复前：**
```javascript
const headers = ref({ Authorization: "Bearer " + getToken() })
```

**修复后：**
```javascript
const headers = computed(() => {
  const token = getToken()
  return token && token.trim() !== '' ? { Authorization: "Bearer " + token } : {}
})
```

## 🎯 修复效果

1. **避免无效 Token 请求**
   - 当 Token 为空或无效时，不会发送 Authorization 头
   - 减少网关的无效验证请求

2. **更好的错误处理**
   - 登录时验证 Token 有效性
   - 提供清晰的错误提示

3. **动态 Token 更新**
   - 使用 computed 属性，Token 变化时自动更新
   - 确保始终使用最新的有效 Token

## 📝 测试建议

1. **清除浏览器缓存和 Cookie**
   - 清除所有 Cookie（特别是 `Admin-Token`）
   - 重新访问登录页面

2. **测试登录流程**
   - 正常登录，验证 Token 是否正确保存
   - 检查浏览器 Network 标签，确认 Authorization 头格式正确

3. **测试未登录访问**
   - 清除 Token 后访问需要认证的页面
   - 确认不会发送无效的 Authorization 头

4. **测试 Token 过期**
   - 等待 Token 过期或手动修改 Token
   - 确认系统正确处理 401 错误

## 🔗 相关文件

- `src/utils/request.js` - 请求拦截器
- `src/store/modules/user.js` - 用户状态管理
- `src/components/FileUpload/index.vue` - 文件上传组件
- `src/components/Editor/index.vue` - 富文本编辑器组件
- `src/components/ImageUpload/index.vue` - 图片上传组件

## ⚠️ 注意事项

1. **后端网关配置**
   - 确保后端网关正确配置了 JWT 验证
   - 检查网关的 CORS 配置（如果需要）

2. **Token 格式**
   - 确保后端返回的 Token 是有效的 JWT 格式
   - JWT 应该包含 3 个部分，用 `.` 分隔

3. **环境变量**
   - 确认 `.env.development` 中 `VITE_APP_BASE_API` 配置正确
   - 确认 `vite.config.js` 中的代理配置正确

## 🚀 下一步

1. 重启前端开发服务器
2. 清除浏览器缓存和 Cookie
3. 重新登录测试
4. 检查后端网关日志，确认不再出现 JWT 错误
