<template>
  <div class="infra-shell">
    <div class="mesh">
      <div class="orb orb1"></div>
      <div class="orb orb2"></div>
      <div class="orb orb3"></div>
    </div>

    <section class="content">
      <div class="intro-card">
        <p class="eyebrow">ZOU MH INFRA</p>
        <h1>基础服务入口保留，后台登录单独收口。</h1>
        <p class="summary">
          登录页回到基础服务门户风格，保留统一视觉入口。
          当前后台登录不使用验证码，只需要账号和密码。
        </p>

        <div class="service-grid">
          <a
            v-for="service in services"
            :key="service.name"
            class="service-card"
            :href="service.href"
            target="_blank"
            rel="noreferrer"
          >
            <span class="service-name">{{ service.name }}</span>
            <span class="service-desc">{{ service.desc }}</span>
          </a>
        </div>
      </div>

      <div class="login-card">
        <div class="login-head">
          <p class="head-tag">CONTROL PANEL</p>
          <h2>登录后台</h2>
          <p>{{ helperText }}</p>
        </div>

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
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

          <div class="form-note">
            <span>当前登录不校验验证码。</span>
            <router-link class="action-link" to="/register">去注册</router-link>
          </div>

          <el-form-item>
            <el-button :loading="loading" size="large" type="primary" class="submit-btn" @click="handleLogin">
              <span v-if="!loading">进入后台</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const services = [
  { name: 'Nacos', desc: '配置与注册中心', href: '/nacos/' },
  { name: 'Jenkins', desc: '持续集成', href: '/jenkins/' },
  { name: 'XXL-JOB', desc: '任务调度中心', href: '/xxl-job-admin/' },
  { name: 'Seata', desc: '事务控制台', href: '/seata/' }
]

const loginForm = ref({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: ''
})

const loading = ref(false)
const redirect = ref(undefined)
const loginRef = ref(null)
const registerHintShown = ref(false)

const loginRules = computed(() => ({
  username: [{ required: true, trigger: 'blur', message: '请输入账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
}))

const helperText = computed(() => {
  if (route.query?.registered === '1') {
    return '账号已创建成功，输入密码后可直接进入后台。'
  }
  return '请输入账号和密码进入后台管理。'
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
      ElMessage.success('注册成功，请登录系统')
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
      ElMessage.warning('请输入账号和密码')
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
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.infra-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f4f4ff;
  color: #12122a;
}

.mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: drift 18s ease-in-out infinite;
}

.orb1 {
  top: -180px;
  left: -120px;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.18), transparent 70%);
}

.orb2 {
  right: -140px;
  top: 24%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.14), transparent 70%);
  animation-delay: -6s;
}

.orb3 {
  bottom: -140px;
  left: 28%;
  width: 460px;
  height: 460px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.14), transparent 70%);
  animation-delay: -10s;
}

.content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(360px, 430px);
  gap: 28px;
  align-items: center;
  padding: 40px clamp(20px, 5vw, 64px);
}

.intro-card,
.login-card {
  border: 1px solid rgba(108, 99, 255, 0.12);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 50px rgba(52, 46, 108, 0.12);
  backdrop-filter: blur(14px);
}

.intro-card {
  padding: clamp(28px, 4vw, 44px);
}

.eyebrow,
.head-tag {
  margin: 0 0 14px;
  color: #6c63ff;
  font-size: 12px;
  letter-spacing: 0.24em;
}

.intro-card h1,
.login-head h2 {
  margin: 0;
  line-height: 1.04;
}

.intro-card h1 {
  max-width: 760px;
  font-size: clamp(38px, 5vw, 72px);
}

.summary,
.login-head p {
  margin: 18px 0 0;
  color: #5555a0;
  font-size: 16px;
  line-height: 1.8;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.service-card {
  display: block;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(244, 244, 255, 0.92));
  border: 1px solid rgba(108, 99, 255, 0.12);
  text-decoration: none;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(108, 99, 255, 0.14);
  border-color: rgba(108, 99, 255, 0.3);
}

.service-name {
  display: block;
  color: #12122a;
  font-size: 18px;
  font-weight: 700;
}

.service-desc {
  display: block;
  margin-top: 8px;
  color: #5555a0;
  font-size: 14px;
}

.login-card {
  padding: 28px;
}

.login-head {
  margin-bottom: 24px;
}

.login-head h2 {
  font-size: 34px;
}

:deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(108, 99, 255, 0.12) inset;
}

.input-icon {
  color: #6c63ff;
}

.form-note {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 22px;
  color: #6666aa;
  font-size: 14px;
}

.action-link {
  color: #6c63ff;
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  min-height: 50px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #6c63ff, #a855f7);
  box-shadow: 0 14px 28px rgba(108, 99, 255, 0.24);
}

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(36px, -52px) scale(1.06);
  }

  66% {
    transform: translate(-28px, 36px) scale(0.95);
  }
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 18px;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .form-note {
    flex-direction: column;
  }
}
</style>
