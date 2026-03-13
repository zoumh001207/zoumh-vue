<template>
  <div class="auth-shell">
    <div class="auth-bg"></div>
    <div class="auth-grid">
      <section class="brand-panel">
        <div class="brand-badge">智慧运营后台</div>
        <h1>清晰入口，稳定登录，减少一次多余点击。</h1>
        <p>
          登录区固定在右侧，注册链路尽量缩短。
          如果是首次使用，可以先创建账号，再直接回到登录页进入系统。
        </p>
        <div class="feature-list">
          <div class="feature-item">
            <strong>右侧直达</strong>
            <span>账号、密码、验证码集中在单列区域，减少视觉跳转。</span>
          </div>
          <div class="feature-item">
            <strong>注册闭环</strong>
            <span>注册成功后自动回填账号，直接输入密码登录。</span>
          </div>
          <div class="feature-item">
            <strong>错误可见</strong>
            <span>接口报错会直接显示，不再出现“点了没反应”的状态。</span>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <div class="form-card compact-card">
          <div class="form-header">
            <p class="eyebrow">SIGN IN</p>
            <h2>登录系统</h2>
            <p class="desc">请输入账号和密码，进入后台工作区。</p>
          </div>

          <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="auth-form">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                autocomplete="off"
                clearable
                placeholder="账号"
              >
                <template #prefix>
                  <svg-icon icon-class="user" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                autocomplete="off"
                placeholder="密码"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="password" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item v-if="captchaEnabled" prop="code">
              <div class="captcha-row">
                <el-input
                  v-model="loginForm.code"
                  size="large"
                  autocomplete="off"
                  clearable
                  placeholder="验证码"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix>
                    <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                  </template>
                </el-input>
                <img :src="codeUrl" @click="getCode" class="captcha-img" />
              </div>
            </el-form-item>

            <div class="helper-row">
              <span>{{ helperText }}</span>
              <router-link class="action-link" to="/register">去注册</router-link>
            </div>

            <el-form-item>
              <el-button :loading="loading" size="large" type="primary" class="submit-btn" @click="handleLogin">
                <span v-if="!loading">登录系统</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getCodeImg } from '@/api/login'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const loginForm = ref({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: ''
})

const codeUrl = ref('')
const loading = ref(false)
const captchaEnabled = ref(false)
const redirect = ref(undefined)
const loginRef = ref(null)
const registerHintShown = ref(false)

const loginRules = computed(() => ({
  username: [{ required: true, trigger: 'blur', message: '请输入账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }],
  code: captchaEnabled.value
    ? [{ required: true, trigger: 'change', message: '请输入验证码' }]
    : []
}))

const helperText = computed(() => {
  if (route.query?.registered === '1') {
    return '账号已创建成功，现在只需要输入密码即可登录。'
  }
  return '首次使用可先注册账号。'
})

watch(
  () => route,
  (newRoute) => {
    redirect.value = newRoute.query?.redirect

    if (typeof newRoute.query?.username === 'string' && newRoute.query.username) {
      loginForm.value.username = newRoute.query.username
      loginForm.value.password = ''
    }

    if (newRoute.query?.registered === '1' && !registerHintShown.value) {
      ElMessage.success('注册成功，请输入密码登录')
      registerHintShown.value = true
    }
  },
  { immediate: true }
)

function handleLogin() {
  if (!loginRef.value) {
    ElMessage.error('登录表单未初始化')
    return
  }

  loginRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning(captchaEnabled.value ? '请完善登录信息后再试' : '请输入账号和密码')
      return
    }

    loading.value = true

    try {
      await userStore.login(loginForm.value)
      const query = route.query || {}
      const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
        if (!['redirect', 'registered', 'username'].includes(cur)) {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
      router.push({ path: redirect.value || '/index', query: otherQueryParams })
    } catch (error) {
      console.error('登录失败:', error)
      if (captchaEnabled.value) {
        getCode()
      }
    } finally {
      loading.value = false
    }
  })
}

function getCode() {
  getCodeImg()
    .then((res) => {
      captchaEnabled.value = res?.captchaEnabled === undefined ? true : !!res.captchaEnabled
      if (captchaEnabled.value) {
        codeUrl.value = 'data:image/gif;base64,' + (res.img || '')
        loginForm.value.uuid = res.uuid || ''
      } else {
        loginForm.value.code = ''
        loginForm.value.uuid = ''
        loginRef.value?.clearValidate('code')
      }
    })
    .catch((error) => {
      console.error('获取验证码失败:', error)
      captchaEnabled.value = false
      loginForm.value.code = ''
      loginForm.value.uuid = ''
      loginRef.value?.clearValidate('code')
    })
}

getCode()
</script>

<style lang="scss" scoped>
.auth-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 210, 120, 0.45), transparent 28%),
    radial-gradient(circle at bottom right, rgba(205, 93, 63, 0.25), transparent 32%),
    linear-gradient(135deg, #f3ece2 0%, #d4e4dd 46%, #f7f3ee 100%);
}

.auth-bg::before,
.auth-bg::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(6px);
}

.auth-bg::before {
  top: 10%;
  left: -120px;
  width: 340px;
  height: 340px;
  background: rgba(184, 92, 56, 0.14);
}

.auth-bg::after {
  right: -90px;
  bottom: 10%;
  width: 300px;
  height: 300px;
  background: rgba(55, 95, 78, 0.16);
}

.auth-grid {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 380px);
  align-items: center;
  gap: 40px;
  padding: 48px clamp(24px, 5vw, 72px);
}

.brand-panel {
  max-width: 700px;
  color: #1f2b24;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  color: #8b4a2d;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.brand-panel h1 {
  margin: 22px 0 18px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(40px, 5vw, 68px);
  line-height: 1.04;
}

.brand-panel > p {
  max-width: 560px;
  margin: 0 0 28px;
  color: rgba(31, 43, 36, 0.8);
  font-size: 18px;
  line-height: 1.8;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-item {
  padding: 18px;
  border: 1px solid rgba(31, 43, 36, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.54);
}

.feature-item strong {
  display: block;
  margin-bottom: 8px;
  color: #8b4a2d;
  font-size: 16px;
}

.feature-item span {
  color: rgba(31, 43, 36, 0.74);
  font-size: 14px;
  line-height: 1.7;
}

.form-panel {
  display: flex;
  justify-content: flex-end;
}

.form-card {
  width: 100%;
  max-width: 380px;
  padding: 30px;
  border-radius: 28px;
  background: rgba(255, 252, 247, 0.88);
  border: 1px solid rgba(140, 91, 65, 0.12);
  box-shadow: 0 24px 80px rgba(65, 45, 28, 0.16);
  backdrop-filter: blur(22px);
}

.form-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #b2653f;
  font-size: 12px;
  letter-spacing: 0.18em;
}

.form-header h2 {
  margin: 0;
  color: #1e2823;
  font-size: 32px;
  font-family: Georgia, 'Times New Roman', serif;
}

.desc {
  margin: 10px 0 0;
  color: rgba(30, 40, 35, 0.66);
  font-size: 14px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(135, 88, 60, 0.08) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(176, 101, 63, 0.55) inset;
}

.input-icon {
  width: 14px;
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  gap: 12px;
  width: 100%;
}

.captcha-img {
  width: 118px;
  height: 50px;
  border-radius: 16px;
  object-fit: cover;
  cursor: pointer;
  background: #f0ebe5;
}

.helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 4px 0 18px;
  color: rgba(30, 40, 35, 0.6);
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #b6643f 0%, #8f4a2d 100%);
  box-shadow: 0 16px 28px rgba(182, 100, 63, 0.24);
}

.action-link {
  color: #8f4a2d;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.action-link:hover {
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .auth-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .form-panel {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .auth-grid {
    padding: 24px 16px 32px;
  }

  .brand-panel h1 {
    font-size: 42px;
  }

  .brand-panel > p {
    font-size: 16px;
  }

  .form-card {
    padding: 24px 18px;
    border-radius: 22px;
  }

  .captcha-row,
  .helper-row {
    grid-template-columns: 1fr;
    display: grid;
  }

  .captcha-img {
    width: 100%;
  }
}
</style>
