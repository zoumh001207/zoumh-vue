<template>
  <div class="console-shell">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <section class="console-frame">
      <aside class="rail">
        <div class="rail-title">
          <p>Zoumh</p>
        </div>

        <div class="rail-icons">
          <button
            v-for="nav in quickNav"
            :key="nav.name"
            class="rail-btn"
            type="button"
            :title="nav.name"
            @click="openLink(nav)"
          >
            <span>{{ nav.icon }}</span>
          </button>
        </div>
      </aside>

      <main class="stage">
        <header class="topbar">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <span>搜索服务、入口、控制台</span>
          </div>

          <div class="ai-search">ai搜索</div>

          <div class="top-actions">
            <button type="button" class="ghost-chip" @click="openInternal('/jenkins/')">CI</button>
            <button type="button" class="ghost-chip" @click="openInternal('/nacos/')">NC</button>
            <button type="button" class="ghost-chip" @click="openInternal('/minio/')">MO</button>
            <button type="button" class="profile-chip" @click="goPrimary">
              <span class="profile-avatar">{{ profileInitial }}</span>
              <span class="profile-label">{{ primaryLabel }}</span>
            </button>
          </div>
        </header>

        <section class="board">
          <article class="hero-card music-card">
            <div class="hero-badges">
              <span class="live-badge">Live</span>
              <span class="scene-badge">Production</span>
            </div>

            <div class="music-copy">
              <p class="eyebrow">Now Playing</p>
              <h1>午夜控制台</h1>
              <p>
                把首页改成播放器式主视觉，右上角继续保留登录和后台入口。
                当前核心服务在线，文件链路已经恢复。
              </p>
            </div>

            <div class="player-panel">
              <div class="cover-disc"></div>
              <div class="track-meta">
                <strong>Neon Console</strong>
                <span>zoumh system mix</span>
              </div>
              <div class="progress-line">
                <i></i>
              </div>
              <div class="player-controls">
                <button type="button">◁</button>
                <button type="button" class="play-btn">▶</button>
                <button type="button">▷</button>
              </div>
            </div>

            <div class="hero-actions">
              <button type="button" class="primary-action" @click="goPrimary">{{ primaryLabel }}</button>
              <button type="button" class="secondary-action" @click="openInternal('/minio/')">查看文件中心</button>
            </div>
          </article>

          <article class="panel-card service-card">
            <div class="card-head">
              <div>
                <p class="card-kicker">Gateway</p>
                <h3>业务入口</h3>
              </div>
              <span class="status-dot"></span>
            </div>
            <div class="metric-value">{{ services.length }}</div>
            <p class="metric-desc">当前保留的主要控制台入口</p>
            <div class="service-grid">
              <button
                v-for="service in services"
                :key="service.name"
                type="button"
                class="service-pill"
                @click="openLink(service)"
              >
                <span>{{ service.name }}</span>
                <small>{{ service.desc }}</small>
              </button>
            </div>
          </article>

          <article class="panel-card game-card">
            <div class="card-head">
              <div>
                <p class="card-kicker">Storage</p>
                <h3>游戏模块</h3>
              </div>
              <span class="metric-badge">MinIO</span>
            </div>

            <div class="game-stage">
              <div class="game-orb"></div>
              <div class="game-copy">
                <strong>Game Hub</strong>
                <p>这里先作为游戏模块位，后面可以继续接你要展示的项目或独立应用。</p>
              </div>
            </div>

            <button type="button" class="inline-link" @click="openInternal('/minio/')">进入对象存储</button>
          </article>

          <article class="footer-card">
            <p class="card-kicker">Record</p>
            <div class="footer-content">
              <strong>备案信息</strong>
              <span>这里预留备案号、版权说明和底部固定信息，后面你给正式内容我再替换。</span>
            </div>
          </article>
        </section>
      </main>
    </section>

    <ConsoleLoginModal v-model="loginVisible" @close="handleLoginClose" />
    <ConsoleRegisterModal v-model="registerVisible" @close="handleRegisterClose" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getToken } from '@/utils/auth'
import ConsoleLoginModal from '@/components/ConsoleLoginModal.vue'
import ConsoleRegisterModal from '@/components/ConsoleRegisterModal.vue'

const router = useRouter()
const route = useRoute()

const services = [
  { name: 'Jenkins', desc: '持续集成', href: '/jenkins/', external: true },
  { name: 'Nacos', desc: '注册配置', href: '/nacos/', external: true },
  { name: 'XXL-JOB', desc: '任务调度', href: '/xxl-job-admin/', external: true },
  { name: 'Seata', desc: '事务控制', href: '/seata/', external: true },
  { name: 'MinIO', desc: '文件对象', href: '/minio/', external: true },
  { name: 'ncm2mp3', desc: '音频转换', href: '/ncm2mp3/', external: true }
]

const quickNav = [
  { name: '首页', icon: '⌂', href: '/', external: false },
  { name: '构建', icon: '⌘', href: '/jenkins/', external: true },
  { name: '文件', icon: '◈', href: '/minio/', external: true },
  { name: '后台', icon: '◎', href: '/login', external: false }
]

const primaryLabel = computed(() => (getToken() ? '进入后台' : '登录'))
const profileInitial = computed(() => (getToken() ? 'A' : '→'))
const loginVisible = ref(false)
const registerVisible = ref(false)

function goPrimary() {
  if (getToken()) {
    router.push('/index')
    return
  }
  loginVisible.value = true
}

function openInternal(path) {
  window.open(path, '_blank')
}

function openLink(item) {
  if (item.external) {
    window.open(item.href, '_blank')
    return
  }
  router.push(item.href)
}

function handleLoginClose() {
  if (route.path === '/login') {
    router.push('/')
  }
}

function handleRegisterClose() {
  if (route.path === '/register') {
    router.push('/')
  }
}

watch(
  () => route.path,
  (path) => {
    loginVisible.value = path === '/login'
    registerVisible.value = path === '/register'
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.console-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 119, 44, 0.14), transparent 28%),
    radial-gradient(circle at right center, rgba(255, 255, 255, 0.05), transparent 24%),
    linear-gradient(145deg, #343641 0%, #1d1f26 36%, #0a0b0f 100%);
  color: #f5f5f5;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  opacity: 0.82;
  pointer-events: none;
}

.ambient-left {
  top: 10%;
  left: -120px;
  width: 360px;
  height: 360px;
  background: rgba(255, 122, 43, 0.14);
}

.ambient-right {
  right: -80px;
  bottom: 16%;
  width: 320px;
  height: 320px;
  background: rgba(120, 128, 255, 0.14);
}

.console-frame {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 18px;
  width: min(1840px, calc(100vw - 20px));
  min-height: 100vh;
  margin: 0 auto;
  padding: 12px 10px;
}

.rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 14px;
  border-radius: 30px;
  background: rgba(10, 11, 15, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(18px);
}

.rail-title {
  min-height: 56px;
  color: rgba(111, 147, 255, 0.56);
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.rail-title p {
  margin: 0;
}

.rail-icons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

.rail-btn {
  width: 100%;
  height: 64px;
  border: 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.82);
  font-size: 21px;
  cursor: pointer;
}

.stage {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.topbar {
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 98px;
  padding: 0 16px;
  border-radius: 30px;
  background: rgba(10, 11, 15, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.28);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.46);
}

.search-icon {
  font-size: 20px;
}

.ai-search {
  color: #ff402d;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.04em;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ghost-chip,
.profile-chip {
  border: 0;
  cursor: pointer;
}

.ghost-chip {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-weight: 700;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 8px 14px 8px 8px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 107, 28, 0.16));
  color: #fff;
}

.profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b1c, #ff9448);
  font-weight: 700;
}

.profile-label {
  font-size: 14px;
  font-weight: 600;
}

.board {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr 0.9fr;
  gap: 18px;
}

.hero-card,
.panel-card,
.footer-card {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 11, 15, 0.82);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.music-card {
  position: relative;
  min-height: 560px;
  padding: 28px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(18, 20, 28, 0.26), rgba(8, 9, 12, 0.9)),
    radial-gradient(circle at 24% 20%, rgba(255, 178, 129, 0.24), transparent 28%),
    radial-gradient(circle at 72% 26%, rgba(83, 108, 255, 0.24), transparent 24%),
    linear-gradient(135deg, #34221b 0%, #181821 42%, #0a0b10 100%);
}

.hero-badges,
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.hero-badges {
  margin-bottom: 42px;
}

.live-badge,
.scene-badge,
.metric-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.live-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background: #ff6b1c;
  box-shadow: 0 0 10px rgba(255, 107, 28, 0.8);
}

.eyebrow,
.card-kicker {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.54);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.music-copy {
  max-width: 520px;
}

.music-copy h1,
.card-head h3 {
  margin: 0;
}

.music-copy h1 {
  font-size: clamp(48px, 5vw, 72px);
  line-height: 1.02;
}

.music-copy p:last-child {
  margin: 20px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 16px;
  line-height: 1.9;
}

.player-panel {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 112px;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 18px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
}

.cover-disc {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #1d1f26 0 18px, #08090c 19px 28px, #2e313d 29px 34px, #0d0f15 35px 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.34);
}

.track-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.track-meta strong {
  font-size: 24px;
}

.track-meta span {
  color: rgba(255, 255, 255, 0.52);
}

.progress-line {
  grid-column: 2;
  height: 6px;
  margin-top: -8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-line i {
  display: block;
  width: 46%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff6b1c, #ff9c56);
}

.player-controls {
  grid-column: 2;
  display: flex;
  gap: 12px;
}

.player-controls button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.player-controls .play-btn {
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
}

.hero-actions {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 28px;
  display: flex;
  gap: 12px;
}

.primary-action,
.secondary-action,
.inline-link,
.service-pill {
  border: 0;
  cursor: pointer;
}

.primary-action,
.secondary-action {
  min-height: 52px;
  padding: 0 22px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
}

.primary-action {
  background: linear-gradient(135deg, #ff6b1c, #ff8540);
  color: #fff;
}

.secondary-action {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.panel-card {
  padding: 18px;
}

.service-card {
  min-height: 560px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status-dot {
  width: 13px;
  height: 13px;
  margin-top: 8px;
  border-radius: 50%;
  background: #31d17c;
  box-shadow: 0 0 18px rgba(49, 209, 124, 0.72);
}

.metric-value {
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
}

.metric-desc {
  margin: -6px 0 0;
  color: rgba(255, 255, 255, 0.56);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: auto;
}

.service-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 98px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  text-align: left;
}

.service-pill span {
  font-size: 16px;
  font-weight: 700;
}

.service-pill small {
  color: rgba(255, 255, 255, 0.5);
}

.game-card {
  min-height: 560px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(255, 107, 28, 0.14), transparent 28%),
    rgba(10, 11, 15, 0.84);
}

.game-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 22px;
}

.game-orb {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.36), transparent 18%),
    radial-gradient(circle at 50% 50%, rgba(255, 115, 44, 0.2), transparent 58%),
    linear-gradient(135deg, #1d1f26, #090a0e);
  box-shadow:
    inset 0 0 40px rgba(255, 255, 255, 0.04),
    0 24px 50px rgba(0, 0, 0, 0.4);
}

.game-copy {
  max-width: 320px;
  text-align: center;
}

.game-copy strong {
  display: block;
  margin-bottom: 12px;
  font-size: 42px;
}

.game-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
}

.inline-link {
  padding: 0;
  background: transparent;
  color: #ff8a43;
  font-weight: 700;
}

.footer-card {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 120px;
  padding: 0 28px;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 22px;
}

.footer-content strong {
  font-size: 48px;
  font-weight: 700;
  color: #ff4331;
}

.footer-content span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 15px;
}

@media (max-width: 1320px) {
  .board {
    grid-template-columns: 1fr 1fr;
  }

  .music-card,
  .footer-card {
    grid-column: 1 / -1;
  }

  .game-card {
    min-height: 420px;
  }
}

@media (max-width: 920px) {
  .console-frame {
    grid-template-columns: 1fr;
    width: 100%;
    padding: 12px;
  }

  .rail {
    flex-direction: row;
    align-items: center;
    gap: 14px;
  }

  .rail-icons {
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 0;
  }

  .topbar {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .board,
  .service-grid {
    grid-template-columns: 1fr;
  }

  .music-card,
  .footer-card {
    grid-column: auto;
  }

  .player-panel {
    position: static;
    margin-top: 28px;
  }

  .hero-actions {
    position: static;
    margin-top: 18px;
    flex-direction: column;
  }

  .footer-card,
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-content strong {
    font-size: 34px;
  }
}
</style>
