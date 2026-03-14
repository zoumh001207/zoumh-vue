<template>
  <div class="portal-shell">
    <div class="mesh">
      <div class="orb orb1"></div>
      <div class="orb orb2"></div>
      <div class="orb orb3"></div>
    </div>

    <section class="portal">
      <header class="hero">
        <div>
          <p class="eyebrow">ZOU MH SERVICE HUB</p>
          <h1>基础服务门户</h1>
          <p class="summary">
            公共服务入口保留在首页，后台管理通过统一登录进入。
            首页只做服务导航，不再伪造登录成功提示。
          </p>
        </div>

        <div class="hero-actions">
          <el-button type="primary" size="large" class="login-btn" @click="goPrimary">
            {{ primaryLabel }}
          </el-button>
          <el-button plain size="large" class="register-btn" @click="router.push('/register')">
            创建账号
          </el-button>
        </div>
      </header>

      <section class="cards">
        <a
          v-for="service in services"
          :key="service.name"
          class="card"
          :href="service.href"
          :target="service.external ? '_blank' : '_self'"
          rel="noreferrer"
        >
          <span class="card-name">{{ service.name }}</span>
          <span class="card-desc">{{ service.desc }}</span>
        </a>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getToken } from '@/utils/auth'

const router = useRouter()

const services = [
  { name: '后台登录', desc: '进入业务后台管理', href: '/login', external: false },
  { name: 'Jenkins', desc: '持续集成任务中心', href: '/jenkins/', external: true },
  { name: 'Nacos', desc: '配置中心与注册发现', href: '/nacos/', external: true },
  { name: 'XXL-JOB', desc: '调度任务管理', href: '/xxl-job-admin/', external: true },
  { name: '禅道', desc: '项目管理入口', href: '/zentao/', external: true },
  { name: 'Seata', desc: '分布式事务控制台', href: '/seata/', external: true },
  { name: '农场工具', desc: '外部业务应用', href: '/farm/', external: true },
  { name: '音频转换', desc: 'ncm2mp3 服务入口', href: '/ncm2mp3/', external: true }
]

const primaryLabel = computed(() => (getToken() ? '进入后台' : '登录后台'))

function goPrimary() {
  router.push(getToken() ? '/index' : '/login')
}
</script>

<style lang="scss" scoped>
.portal-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f4f4ff;
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
  left: -110px;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.18), transparent 70%);
}

.orb2 {
  right: -140px;
  top: 24%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 70%);
  animation-delay: -6s;
}

.orb3 {
  bottom: -130px;
  left: 35%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%);
  animation-delay: -11s;
}

.portal {
  position: relative;
  z-index: 1;
  padding: 36px clamp(20px, 5vw, 60px) 44px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  margin-bottom: 30px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #6c63ff;
  font-size: 12px;
  letter-spacing: 0.24em;
}

.hero h1 {
  margin: 0;
  color: #12122a;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.02;
}

.summary {
  max-width: 760px;
  margin: 18px 0 0;
  color: #5555a0;
  font-size: 17px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.login-btn,
.register-btn {
  min-width: 140px;
  min-height: 48px;
  border-radius: 14px;
}

.login-btn {
  border: none;
  background: linear-gradient(135deg, #6c63ff, #a855f7);
  box-shadow: 0 14px 28px rgba(108, 99, 255, 0.22);
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.card {
  display: block;
  min-height: 140px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(108, 99, 255, 0.12);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 36px rgba(52, 46, 108, 0.1);
  color: inherit;
  text-decoration: none;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 40px rgba(52, 46, 108, 0.14);
  border-color: rgba(108, 99, 255, 0.28);
}

.card-name {
  display: block;
  color: #12122a;
  font-size: 22px;
  font-weight: 700;
}

.card-desc {
  display: block;
  margin-top: 12px;
  color: #6666aa;
  font-size: 14px;
  line-height: 1.75;
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

@media (max-width: 1080px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero {
    flex-direction: column;
    align-items: start;
  }
}

@media (max-width: 640px) {
  .portal {
    padding: 18px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    width: 100%;
  }
}
</style>
