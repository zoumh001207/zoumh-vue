<template>
  <transition name="console-fade">
    <div v-if="modelValue" class="console-modal-mask" @click.self="handleClose">
      <section class="console-modal">
        <button v-if="closable" type="button" class="close-btn" @click="handleClose">×</button>

        <header class="modal-head">
          <p class="head-tag">CONTROL ACCESS</p>
          <h2>登录后台</h2>
          <p>{{ helperText }}</p>
        </header>

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username" class="compact-item">
            <div class="field-shell">
              <span class="field-icon">
                <svg-icon icon-class="user" class="input-icon" />
              </span>
              <el-input
                v-model="loginForm.username"
                type="text"
                autocomplete="off"
                clearable
                placeholder="账号"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="compact-item">
            <div class="field-shell">
              <span class="field-icon">
                <svg-icon icon-class="password" class="input-icon" />
              </span>
              <el-input
                v-model="loginForm.password"
                type="password"
                autocomplete="off"
                placeholder="密码"
                show-password
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <div class="form-note">
            <span>当前登录不校验验证码。</span>
            <router-link class="action-link" to="/register">去注册</router-link>
          </div>

          <el-form-item class="submit-row">
            <el-button :loading="loading" type="primary" class="submit-btn" @click="handleLogin">
              <span v-if="!loading">进入后台</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'close'])

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

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
  return '输入账号和密码后直接进入后台管理。'
})

watch(
  () => route.fullPath,
  () => {
    redirect.value = route.query?.redirect

    if (typeof route.query?.username === 'string' && route.query.username) {
      loginForm.value.username = route.query.username
      loginForm.value.password = ''
    }

    if (route.query?.registered === '1' && !registerHintShown.value) {
      ElMessage.success('注册成功，请登录系统')
      registerHintShown.value = true
    }
  },
  { immediate: true }
)

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

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
      emit('success')
      emit('update:modelValue', false)
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
.console-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(6, 7, 11, 0.6);
  backdrop-filter: blur(20px);
}

.console-modal {
  position: relative;
  width: min(420px, 100%);
  padding: 24px 28px 22px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background:
    radial-gradient(circle at top right, rgba(255, 107, 28, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(20, 22, 29, 0.98), rgba(10, 11, 15, 0.99));
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.modal-head {
  margin-bottom: 18px;
}

.head-tag {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.46);
  font-size: 11px;
  letter-spacing: 0.26em;
}

.modal-head h2 {
  margin: 0;
  color: #fff;
  font-size: 38px;
  line-height: 1;
}

.modal-head p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  line-height: 1.6;
}

.login-form {
  display: grid;
  gap: 14px;
}

.compact-item {
  margin-bottom: 0;
}

.field-shell {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.input-icon {
  color: #ff8a43;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  min-height: auto;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #fff;
  font-size: 17px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.34);
}

.form-note {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: -2px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.action-link {
  color: #ff8a43;
  text-decoration: none;
}

.submit-row {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
  box-shadow: 0 18px 36px rgba(255, 107, 28, 0.24);
}

.console-fade-enter-active,
.console-fade-leave-active {
  transition: opacity 0.22s ease;
}

.console-fade-enter-from,
.console-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .console-modal-mask {
    padding: 16px;
  }

  .console-modal {
    padding: 22px 18px 18px;
  }

  .modal-head h2 {
    font-size: 32px;
  }

  .field-shell {
    min-height: 50px;
    padding: 0 14px;
  }

  .submit-btn {
    min-height: 48px;
  }

  .form-note {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
