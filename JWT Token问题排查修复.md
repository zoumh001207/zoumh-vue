# JWT Token 问题排查与修复指南

## 🔍 错误信息

```
JWT strings must contain exactly 2 period characters. Found: 0
```

**含义：** JWT 令牌格式无效，必须包含两个点（`.`）分隔符，但实际找到 0 个。

## 📋 问题原因分析

### 1. Token 为空或未传递
- 前端未正确保存 Token
- Token 在请求时丢失
- Cookie 被清除

### 2. Token 格式不正确
- Token 不是有效的 JWT 格式
- Token 字段名不匹配
- Token 值被错误处理

### 3. 请求头配置问题
- Authorization 头未正确设置
- Token 前缀格式错误

## ✅ 已实施的修复

### 1. 增强 Token 验证（`src/store/modules/user.js`）

**修复内容：**
- ✅ 检查多种可能的 token 字段名（`access_token`, `token`, `accessToken`）
- ✅ 验证 JWT 格式（必须包含 2 个点）
- ✅ 添加详细的调试日志
- ✅ 登录失败时显示明确的错误信息

**调试信息：**
```javascript
// 登录时会输出：
- 登录响应数据
- Token 字段检查
- Token 格式验证
- Token 保存状态
```

### 2. 增强请求拦截器（`src/utils/request.js`）

**修复内容：**
- ✅ 检查 Token 是否存在
- ✅ 验证 Token 格式
- ✅ 记录缺少 Token 的请求
- ✅ 显示 Token 格式错误警告

**调试信息：**
```javascript
// 每个请求会检查：
- Token 是否存在
- Token 格式是否正确（2 个点）
- 请求 URL 和方法
```

## 🔧 排查步骤

### 步骤 1: 检查登录流程

1. **打开浏览器控制台（F12）**
2. **清除所有 Cookie 和缓存**
3. **重新登录**
4. **查看控制台输出**

**应该看到：**
```
登录响应数据: {...}
✅ Token 保存成功，长度: XXX
```

**如果看到错误：**
- `未找到 token 字段` → 检查后端返回的字段名
- `Token 格式错误` → 检查后端返回的 token 值
- `登录失败：未获取到有效的访问令牌` → 检查登录接口响应

### 步骤 2: 检查 Token 存储

在浏览器控制台执行：
```javascript
// 检查 Cookie 中的 Token
document.cookie.split(';').find(c => c.includes('Admin-Token'))

// 或使用开发者工具
// Application → Cookies → 查看 Admin-Token
```

**应该看到：**
- Cookie 名称：`Admin-Token`
- Cookie 值：一个 JWT 格式的字符串（包含 2 个点）

### 步骤 3: 检查网络请求

在 Network 标签中查看请求：

1. **登录请求** (`/auth/login`)
   - 查看 Response，确认返回了 token
   - 检查 token 字段名和值

2. **菜单请求** (`/system/menu/getRouters`)
   - 查看 Request Headers
   - 确认 `Authorization: Bearer {token}` 存在
   - 检查 token 值是否正确

### 步骤 4: 验证 Token 格式

在浏览器控制台执行：
```javascript
// 获取 Token
const token = document.cookie.split(';').find(c => c.includes('Admin-Token'))?.split('=')[1]

if (token) {
  // 检查格式
  const parts = token.split('.')
  console.log('Token 部分数量:', parts.length)
  console.log('Token 格式:', parts.length === 3 ? '✅ 正确' : '❌ 错误')
  console.log('Token 预览:', token.substring(0, 50) + '...')
} else {
  console.log('❌ 未找到 Token')
}
```

**正确格式：**
- 应该包含 3 个部分（用 2 个点分隔）
- 例如：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

## 🐛 常见问题及解决方案

### 问题 1: 后端返回的 token 字段名不匹配

**症状：** 控制台显示 `未找到 token 字段`

**解决方案：**
检查后端登录接口返回的字段名，修改 `src/store/modules/user.js`：

```javascript
// 如果后端返回的是其他字段名，添加到这里
token = data.access_token || data.token || data.accessToken || data.your_token_field
```

### 问题 2: Token 格式不正确

**症状：** 控制台显示 `Token 格式错误`

**可能原因：**
- 后端返回的不是 JWT 格式
- Token 被截断或损坏

**解决方案：**
1. 检查后端 JWT 生成逻辑
2. 确认返回的是完整的 JWT token
3. 检查是否有字符串处理导致 token 被修改

### 问题 3: Token 未保存到 Cookie

**症状：** 登录后 Cookie 中没有 `Admin-Token`

**可能原因：**
- Cookie 设置失败
- 浏览器阻止了 Cookie
- Cookie 作用域配置错误

**解决方案：**
1. 检查浏览器 Cookie 设置
2. 确认不是无痕模式
3. 检查 Cookie 的 domain 和 path 配置

### 问题 4: Token 在请求时丢失

**症状：** 登录成功，但后续请求没有 Authorization 头

**可能原因：**
- Token 被清除
- 请求拦截器逻辑错误
- Cookie 读取失败

**解决方案：**
1. 检查 `getToken()` 函数是否正常工作
2. 查看控制台的 Token 检查日志
3. 确认请求拦截器逻辑正确

## 🔍 调试工具

### 浏览器控制台命令

```javascript
// 1. 检查当前 Token
console.log('Token:', document.cookie.split(';').find(c => c.includes('Admin-Token')))

// 2. 检查 Pinia Store 中的 Token
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
console.log('Store Token:', userStore.token)

// 3. 手动设置 Token（测试用）
import { setToken } from '@/utils/auth'
setToken('your-test-token')

// 4. 测试请求（需要先登录）
fetch('/dev-api/system/menu/getRouters', {
  headers: {
    'Authorization': 'Bearer ' + (document.cookie.split(';').find(c => c.includes('Admin-Token'))?.split('=')[1] || '')
  }
}).then(res => res.json()).then(data => console.log('菜单数据:', data))
```

## 📝 检查清单

- [ ] 登录接口返回了 token
- [ ] Token 字段名正确（`access_token` 或其他）
- [ ] Token 格式正确（包含 2 个点，3 个部分）
- [ ] Token 已保存到 Cookie（`Admin-Token`）
- [ ] 请求时正确读取了 Token
- [ ] Authorization 头格式正确（`Bearer {token}`）
- [ ] 浏览器控制台没有 Token 相关错误
- [ ] 网络请求中包含了 Authorization 头

## 🚀 快速测试

### 测试 1: 完整登录流程

1. 清除所有 Cookie
2. 打开浏览器控制台
3. 执行登录操作
4. 查看控制台输出：
   - ✅ 应该看到 "Token 保存成功"
   - ✅ 应该看到 Token 长度
   - ❌ 不应该看到任何错误

### 测试 2: 验证 Token 传递

1. 登录成功后
2. 打开 Network 标签
3. 触发任意需要认证的请求（如获取菜单）
4. 查看请求头：
   - ✅ 应该看到 `Authorization: Bearer {token}`
   - ✅ Token 应该是完整的 JWT 格式

### 测试 3: 手动验证 Token

在控制台执行：
```javascript
const token = document.cookie.split(';').find(c => c.includes('Admin-Token'))?.split('=')[1]
if (token) {
  const parts = token.split('.')
  if (parts.length === 3) {
    console.log('✅ Token 格式正确')
    console.log('Token 长度:', token.length)
  } else {
    console.error('❌ Token 格式错误，部分数量:', parts.length)
  }
} else {
  console.error('❌ 未找到 Token')
}
```

## 📞 需要的信息

如果问题仍未解决，请提供：

1. **浏览器控制台完整日志**
   - 登录时的输出
   - Token 相关的警告和错误

2. **网络请求详情**
   - `/auth/login` 的完整响应
   - `/system/menu/getRouters` 的请求头

3. **后端登录接口响应**
   - 返回的 JSON 结构
   - Token 字段名和值

4. **Cookie 信息**
   - `Admin-Token` 的值（前 50 个字符）
   - Cookie 的 domain 和 path

## 🔗 相关文档

- [后端对接指南](./后端对接指南.md)
- [故障排查指南](./故障排查指南.md)
- [JWT错误修复说明](./JWT错误修复说明.md)
