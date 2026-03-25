<template>
  <transition name="console-fade">
    <div v-if="modelValue" class="console-modal-mask" @click.self="handleClose">
      <section class="console-modal">
        <button v-if="closable" type="button" class="close-btn" @click="handleClose">×</button>

        <header class="modal-head">
          <p class="head-tag">CREATE ACCOUNT</p>
          <h2>创建账号</h2>
          <p>先完成基础注册，再返回登录进入后台。</p>
        </header>

        <div v-if="successVisible" class="success-panel">
          <div class="success-badge">✓</div>
          <div class="success-copy">
            <p class="success-title">注册成功</p>
            <p>账号 {{ successUsername }} 已创建，现在可以直接登录。</p>
          </div>
          <button type="button" class="success-btn" @click="handleSuccessConfirm">去登录</button>
        </div>

        <el-form
          v-if="!successVisible"
          ref="registerRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
        >
          <el-form-item prop="username" class="compact-item">
            <div class="field-shell">
              <span class="field-icon">
                <svg-icon icon-class="user" class="input-icon" />
              </span>
              <el-input
                v-model="registerForm.username"
                type="text"
                autocomplete="off"
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
                v-model="registerForm.password"
                type="password"
                autocomplete="off"
                placeholder="密码"
                show-password
              />
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword" class="compact-item">
            <div class="field-shell">
              <span class="field-icon">
                <svg-icon icon-class="password" class="input-icon" />
              </span>
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                autocomplete="off"
                placeholder="确认密码"
                show-password
                @keyup.enter="handleRegister"
              />
            </div>
          </el-form-item>

          <el-form-item v-if="captchaEnabled" prop="code" class="compact-item">
            <div class="captcha-shell">
              <div class="field-shell">
                <span class="field-icon">
                  <svg-icon icon-class="validCode" class="input-icon" />
                </span>
                <el-input
                  v-model="registerForm.code"
                  type="text"
                  autocomplete="off"
                  placeholder="验证码"
                  @keyup.enter="handleRegister"
                />
              </div>
              <img :src="codeUrl" class="captcha-img" @click="getCode" />
            </div>
          </el-form-item>

          <div class="form-note">
            <span>仅提交后端稳定支持的最小注册参数。</span>
            <router-link class="action-link" to="/login">返回登录</router-link>
          </div>

          <el-form-item class="submit-row">
            <el-button :loading="loading" type="primary" class="submit-btn" @click="handleRegister">
              <span v-if="!loading">创建账号</span>
              <span v-else>提交中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { getCodeImg, register } from '@/api/login'

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

const router = useRouter()
const registerRef = ref(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const codeUrl = ref('')
const successVisible = ref(false)
const successUsername = ref('')

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: ''
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const registerRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入账号' },
    { min: 2, max: 20, trigger: 'blur', message: '账号长度需在 2 到 20 个字符之间' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    { min: 5, max: 20, trigger: 'blur', message: '密码长度需在 5 到 20 个字符之间' },
    { pattern: /^[^<>"'|\\]+$/, trigger: 'blur', message: '密码不能包含非法字符' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入密码' },
    { validator: equalToPassword, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleRegister() {
  if (!registerRef.value) {
    ElMessage.error('注册表单未初始化')
    return
  }

  registerRef.value.validate((valid) => {
    if (!valid) {
      return
    }

    loading.value = true
    register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      code: registerForm.value.code,
      uuid: registerForm.value.uuid
    })
      .then(() => {
        successUsername.value = registerForm.value.username
        successVisible.value = true
      })
      .catch((error) => {
        ElMessage.error(error?.message || '注册失败')
        if (captchaEnabled.value) {
          getCode()
        }
      })
      .finally(() => {
        loading.value = false
      })
  })
}

function handleSuccessConfirm() {
  emit('success')
  emit('update:modelValue', false)
  successVisible.value = false
  router.push({
    path: '/login',
    query: {
      username: successUsername.value,
      registered: '1'
    }
  })
}

function getCode() {
  getCodeImg()
    .then((res) => {
      captchaEnabled.value = res?.captchaEnabled === undefined ? true : !!res.captchaEnabled
      if (captchaEnabled.value) {
        codeUrl.value = 'data:image/gif;base64,' + (res.img || '')
        registerForm.value.uuid = res.uuid || ''
      } else {
        registerForm.value.code = ''
        registerForm.value.uuid = ''
      }
    })
    .catch((error) => {
      console.error('获取验证码失败:', error)
      captchaEnabled.value = false
      registerForm.value.code = ''
      registerForm.value.uuid = ''
    })
}

getCode()
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
  width: min(440px, 100%);
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

.register-form {
  display: grid;
  gap: 14px;
}

.success-panel {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.success-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #59c96d, #92db55);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.success-title {
  margin: 0 0 4px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.success-copy p:last-child {
  margin: 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 14px;
  line-height: 1.6;
}

.success-btn {
  min-width: 92px;
  min-height: 42px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.compact-item {
  margin-bottom: 0;
}

.field-shell {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.captcha-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 12px;
  width: 100%;
}

.captcha-img {
  width: 100%;
  height: 56px;
  object-fit: cover;
  border-radius: 18px;
  cursor: pointer;
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

:deep(.el-form-item__content) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  min-height: auto;
  padding: 0;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #fff;
  font-size: 17px;
  background: rgba(20, 22, 29, 0.96) !important;
  box-shadow: 0 0 0 1000px rgba(20, 22, 29, 0.96) inset !important;
  -webkit-box-shadow: 0 0 0 1000px rgba(20, 22, 29, 0.96) inset !important;
  border-radius: 10px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.34);
}

:deep(.el-input__inner:-webkit-autofill),
:deep(.el-input__inner:-webkit-autofill:hover),
:deep(.el-input__inner:-webkit-autofill:focus),
:deep(.el-input__inner:-webkit-autofill:active) {
  -webkit-text-fill-color: #fff;
  box-shadow: 0 0 0 1000px rgba(20, 22, 29, 0.96) inset !important;
  -webkit-box-shadow: 0 0 0 1000px rgba(20, 22, 29, 0.96) inset !important;
  transition: background-color 99999s ease-in-out 0s;
  caret-color: #fff;
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

  .field-shell,
  .captcha-img {
    min-height: 50px;
    height: 50px;
    padding: 0 14px;
  }

  .captcha-shell {
    grid-template-columns: 1fr;
  }

  .submit-btn {
    min-height: 48px;
  }

  .form-note {
    flex-direction: column;
    align-items: flex-start;
  }

  .success-panel {
    grid-template-columns: 1fr;
  }
}
</style>
