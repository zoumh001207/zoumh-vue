<template>
  <div class="auth-shell register-shell">
    <div class="auth-bg"></div>
    <div class="auth-grid">
      <section class="brand-panel">
        <div class="brand-badge">REGISTER</div>
        <h1>先创建基础账号，再进入系统继续完善资料。</h1>
        <p>
          当前注册页只提交后端稳定支持的最小注册参数，避免因为额外字段导致接口直接报错。
          资料补全可以放到登录后再做。
        </p>
        <div class="feature-stack">
          <div class="stack-card">
            <span>01</span>
            <strong>最小必填</strong>
            <p>只保留账号、密码、确认密码，以及按需出现的验证码。</p>
          </div>
          <div class="stack-card">
            <span>02</span>
            <strong>注册回流</strong>
            <p>注册成功后回到登录页，并自动带入你刚创建的账号。</p>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <div class="form-card register-card compact-card">
          <div class="form-header">
            <p class="eyebrow">CREATE ACCOUNT</p>
            <h2>创建账号</h2>
            <p class="desc">完成基础注册后，你就可以返回登录页进入系统。</p>
          </div>

          <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="auth-form">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" size="large" autocomplete="off" clearable placeholder="账号">
                <template #prefix>
                  <svg-icon icon-class="user" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                size="large"
                autocomplete="off"
                placeholder="密码"
                show-password
              >
                <template #prefix>
                  <svg-icon icon-class="password" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                size="large"
                autocomplete="off"
                placeholder="确认密码"
                show-password
                @keyup.enter="handleRegister"
              >
                <template #prefix>
                  <svg-icon icon-class="password" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item v-if="captchaEnabled" prop="code">
              <div class="captcha-row">
                <el-input
                  v-model="registerForm.code"
                  size="large"
                  autocomplete="off"
                  clearable
                  placeholder="验证码"
                  @keyup.enter="handleRegister"
                >
                  <template #prefix>
                    <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                  </template>
                </el-input>
                <img :src="codeUrl" class="captcha-img" @click="getCode" />
              </div>
            </el-form-item>

            <div class="helper-row">
              <span>如果注册失败，会直接显示后端返回的错误信息。</span>
              <router-link class="action-link" to="/login">返回登录</router-link>
            </div>

            <el-form-item>
              <el-button :loading="loading" size="large" type="primary" class="submit-btn register-btn" @click.prevent="handleRegister">
                <span v-if="!loading">创建账号</span>
                <span v-else>提交中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCodeImg, register } from '@/api/login'

const router = useRouter()
const registerRef = ref(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const codeUrl = ref('')

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
        ElMessageBox.alert(
          `<span>账号 <strong>${registerForm.value.username}</strong> 注册成功，现在可以直接登录。</span>`,
          '注册成功',
          {
            dangerouslyUseHTMLString: true,
            type: 'success'
          }
        ).then(() => {
          router.push({
            path: '/login',
            query: {
              username: registerForm.value.username,
              registered: '1'
            }
          })
        })
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
.auth-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(117, 170, 127, 0.22), transparent 26%),
    radial-gradient(circle at bottom right, rgba(242, 173, 95, 0.26), transparent 30%),
    linear-gradient(135deg, #eef4ee 0%, #f6efe5 52%, #f2f7fb 100%);
}

.auth-bg::before,
.auth-bg::after {
  content: '';
  position: absolute;
  border-radius: 999px;
}

.auth-bg::before {
  width: 360px;
  height: 360px;
  left: -120px;
  top: 8%;
  background: rgba(75, 124, 89, 0.12);
}

.auth-bg::after {
  width: 280px;
  height: 280px;
  right: -80px;
  bottom: 10%;
  background: rgba(202, 116, 64, 0.14);
}

.auth-grid {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 380px);
  gap: 40px;
  align-items: center;
  padding: 48px clamp(24px, 5vw, 72px);
}

.brand-panel {
  max-width: 620px;
  color: #1f3027;
}

.brand-badge {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  color: #4b7c59;
  font-size: 12px;
  letter-spacing: 0.18em;
}

.brand-panel h1 {
  margin: 20px 0 16px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(38px, 5vw, 62px);
  line-height: 1.06;
}

.brand-panel > p {
  margin: 0 0 28px;
  color: rgba(31, 48, 39, 0.76);
  font-size: 17px;
  line-height: 1.8;
}

.feature-stack {
  display: grid;
  gap: 16px;
}

.stack-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(31, 48, 39, 0.08);
}

.stack-card span {
  display: inline-block;
  margin-bottom: 8px;
  color: #ca7440;
  font-size: 12px;
  letter-spacing: 0.18em;
}

.stack-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
}

.stack-card p {
  margin: 0;
  color: rgba(31, 48, 39, 0.72);
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
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(75, 124, 89, 0.1);
  box-shadow: 0 24px 70px rgba(49, 67, 56, 0.14);
}

.form-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #4b7c59;
  font-size: 12px;
  letter-spacing: 0.18em;
}

.form-header h2 {
  margin: 0;
  color: #1f3027;
  font-size: 32px;
  font-family: Georgia, 'Times New Roman', serif;
}

.desc {
  margin: 10px 0 0;
  color: rgba(31, 48, 39, 0.64);
  font-size: 14px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(75, 124, 89, 0.1) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(75, 124, 89, 0.45) inset;
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
  background: #edf1eb;
  cursor: pointer;
  object-fit: cover;
}

.helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 4px 0 18px;
  color: rgba(31, 48, 39, 0.58);
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #4b7c59 0%, #335642 100%);
  box-shadow: 0 16px 26px rgba(75, 124, 89, 0.24);
}

.action-link {
  color: #335642;
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

  .form-panel {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .auth-grid {
    padding: 24px 16px 32px;
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
