<template>
  <div class="landing-shell">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">ZOU MH</p>
        <h1>专属主页已经就位，后台入口保持单点直达。</h1>
        <p class="summary">
          这里作为站点首页展示你的个人品牌和项目入口。
          访客先看到主页，登录后直接进入业务后台，不再落到默认管理页。
        </p>
        <div class="action-row">
          <el-button type="primary" size="large" class="primary-action" @click="goPrimary">
            {{ primaryLabel }}
          </el-button>
          <el-button plain size="large" class="secondary-action" @click="router.push('/register')">
            创建账号
          </el-button>
        </div>
      </div>

      <div class="hero-panel">
        <div class="stat-card">
          <span>站点角色</span>
          <strong>个人专属门户</strong>
        </div>
        <div class="stat-card">
          <span>登录流向</span>
          <strong>登录成功后进入后台工作台</strong>
        </div>
        <div class="stat-card accent">
          <span>接口入口</span>
          <strong>`/prod-api/` 统一转发到网关</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getToken } from '@/utils/auth'

const router = useRouter()

const primaryLabel = computed(() => (getToken() ? '进入后台' : '前往登录'))

function goPrimary() {
  router.push(getToken() ? '/index' : '/login')
}
</script>

<style lang="scss" scoped>
.landing-shell {
  min-height: 100vh;
  padding: clamp(24px, 4vw, 48px);
  background:
    radial-gradient(circle at top left, rgba(255, 226, 160, 0.55), transparent 26%),
    radial-gradient(circle at bottom right, rgba(37, 110, 94, 0.22), transparent 30%),
    linear-gradient(135deg, #f5f0e8 0%, #dae6dd 42%, #f7f2eb 100%);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 420px);
  gap: 28px;
  min-height: calc(100vh - clamp(48px, 8vw, 96px));
  padding: clamp(28px, 5vw, 56px);
  border-radius: 36px;
  background: rgba(255, 252, 248, 0.82);
  box-shadow: 0 30px 120px rgba(44, 49, 40, 0.12);
  backdrop-filter: blur(18px);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 760px;
}

.eyebrow {
  margin: 0 0 18px;
  color: #8a4b2a;
  font-size: 13px;
  letter-spacing: 0.32em;
}

.hero-copy h1 {
  margin: 0;
  color: #1d2822;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 6vw, 82px);
  line-height: 1.02;
}

.summary {
  max-width: 620px;
  margin: 22px 0 0;
  color: rgba(29, 40, 34, 0.78);
  font-size: 18px;
  line-height: 1.9;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.primary-action,
.secondary-action {
  min-width: 150px;
  min-height: 50px;
  border-radius: 999px;
}

.primary-action {
  border: none;
  background: linear-gradient(135deg, #1f5f4d 0%, #10392e 100%);
  box-shadow: 0 16px 30px rgba(16, 57, 46, 0.22);
}

.secondary-action {
  border-color: rgba(31, 95, 77, 0.22);
  color: #1f5f4d;
}

.hero-panel {
  display: grid;
  align-content: center;
  gap: 16px;
}

.stat-card {
  padding: 24px;
  border-radius: 24px;
  background: #fffdf9;
  border: 1px solid rgba(31, 40, 34, 0.08);
}

.stat-card span {
  display: block;
  margin-bottom: 10px;
  color: rgba(29, 40, 34, 0.58);
  font-size: 13px;
}

.stat-card strong {
  color: #1d2822;
  font-size: 22px;
  line-height: 1.45;
}

.stat-card.accent {
  background: linear-gradient(135deg, #b96c42 0%, #8d4e2d 100%);
}

.stat-card.accent span,
.stat-card.accent strong {
  color: #fff7f1;
}

@media (max-width: 960px) {
  .hero-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .landing-shell {
    padding: 16px;
  }

  .hero-card {
    padding: 22px;
    border-radius: 26px;
  }

  .summary {
    font-size: 16px;
  }

  .action-row {
    flex-direction: column;
  }
}
</style>
