<template>
  <transition name="console-fade">
    <div v-if="modelValue" class="console-modal-mask" @click.self="handleClose">
      <div class="console-modal">
        <button v-if="closable" type="button" class="close-btn" @click="handleClose">×</button>

        <div class="modal-head">
          <p class="head-tag">CONTROL ACCESS</p>
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
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'

const props = defineProps({
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
  background: rgba(5, 6, 9, 0.58);
  backdrop-filter: blur(18px);
}

.console-modal {
  position: relative;
  width: min(460px, 100%);
  padding: 30px 28px 26px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top right, rgba(255, 107, 28, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(18, 19, 24, 0.96), rgba(8, 9, 12, 0.98));
  box-shadow: 0 32px 100px rgba(0, 0, 0, 0.4);
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
  color: rgba(255, 255, 255, 0.84);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.modal-head {
  margin-bottom: 24px;
}

.head-tag {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  letter-spacing: 0.24em;
}

.modal-head h2 {
  margin: 0;
  color: #fff;
  font-size: 34px;
}

.modal-head p {
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.8;
}

:deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.36);
}

.input-icon {
  color: #ff8a43;
}

.form-note {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 22px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 14px;
}

.action-link {
  color: #ff8a43;
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
  box-shadow: 0 18px 34px rgba(255, 107, 28, 0.22);
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
    padding: 24px 20px 20px;
  }

  .form-note {
    flex-direction: column;
  }
}
</style>
