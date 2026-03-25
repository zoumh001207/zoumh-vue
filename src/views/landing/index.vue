<template>
  <div class="console-shell">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <section class="console-frame">
      <main class="stage">
        <header class="topbar">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input
              v-model="aiKeyword"
              type="text"
              placeholder="ai搜索音乐、项目组件、控制台入口"
              @keyup.enter="handleAiSearch"
            />
            <button type="button" class="search-submit" @click="handleAiSearch">ai搜索</button>
          </div>

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
              <p class="eyebrow">Player Access</p>
              <h1>音乐播放器</h1>
              <p>
                播放器需要登录后使用，支持搜歌、上一曲、下一曲、收藏和创建歌单。
                当前先把交互入口和布局放到首页，后面再继续接真实音源和歌单数据。
              </p>
            </div>

            <div class="player-panel">
              <div class="cover-disc"></div>
              <div class="track-meta">
                <strong>{{ currentTrack.title }}</strong>
                <span>{{ currentTrack.artist }}</span>
              </div>
              <div class="progress-line">
                <i></i>
              </div>
              <div class="playlist-actions">
                <button type="button" @click="ensureMusicAccess('search')">搜歌</button>
                <button type="button" @click="ensureMusicAccess('favorite')">收藏</button>
                <button type="button" @click="ensureMusicAccess('playlist')">创建歌单</button>
              </div>
              <div class="player-controls">
                <button type="button" @click="ensureMusicAccess('prev')">◁</button>
                <button type="button" class="play-btn" @click="ensureMusicAccess('play')">▶</button>
                <button type="button" @click="ensureMusicAccess('next')">▷</button>
              </div>
            </div>

            <div class="hero-actions">
              <button type="button" class="primary-action" @click="goPrimary">{{ primaryLabel }}</button>
              <button type="button" class="secondary-action" @click="ensureMusicAccess('library')">打开歌单库</button>
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
                <p class="card-kicker">Module Placeholder</p>
                <h3>游戏模块</h3>
              </div>
              <span class="metric-badge">Later</span>
            </div>

            <div class="game-stage">
              <div class="game-orb"></div>
              <div class="game-copy">
                <strong>Game Hub</strong>
                <p>这里现在只占用空间，后面你要开发游戏模块时，直接在这块继续接正式内容。</p>
              </div>
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
const aiKeyword = ref('')
const currentTrack = reactive({
  title: 'Neon Console',
  artist: 'zoumh system mix'
})

const services = [
  { name: 'Jenkins', desc: '持续集成', href: '/jenkins/', external: true },
  { name: 'Nacos', desc: '注册配置', href: '/nacos/', external: true },
  { name: 'XXL-JOB', desc: '任务调度', href: '/xxl-job-admin/', external: true },
  { name: 'Seata', desc: '事务控制', href: '/seata/', external: true },
  { name: 'MinIO', desc: '文件对象', href: '/minio/', external: true },
  { name: 'ncm2mp3', desc: '音频转换', href: '/ncm2mp3/', external: true }
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

function ensureMusicAccess(action) {
  if (!getToken()) {
    loginVisible.value = true
    return
  }

  if (action === 'search' && aiKeyword.value.trim()) {
    currentTrack.title = aiKeyword.value.trim()
    currentTrack.artist = 'ai search result'
  }
}

function handleAiSearch() {
  ensureMusicAccess('search')
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
  display: block;
  width: min(1820px, calc(100vw - 28px));
  min-height: 100vh;
  margin: 0 auto;
  padding: 16px 14px 22px;
}

.stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 86px;
  padding: 0 14px;
  border-radius: 26px;
  background: rgba(10, 11, 15, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.28);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-height: 48px;
  padding: 0 8px 0 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.46);
}

.search-icon {
  font-size: 20px;
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  outline: none;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.34);
}

.search-submit {
  min-width: 118px;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
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
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-weight: 700;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 54px;
  padding: 7px 12px 7px 7px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 107, 28, 0.16));
  color: #fff;
}

.profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
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
  grid-template-columns: 1.22fr 0.82fr 0.78fr;
  gap: 16px;
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
  min-height: 500px;
  padding: 24px;
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
  margin-bottom: 30px;
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
  font-size: clamp(38px, 4.2vw, 60px);
  line-height: 1.02;
}

.music-copy p:last-child {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 15px;
  line-height: 1.75;
}

.player-panel {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 98px;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 16px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
}

.cover-disc {
  width: 84px;
  height: 84px;
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
  font-size: 18px;
}

.track-meta span {
  font-size: 13px;
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

.playlist-actions {
  grid-column: 2;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.playlist-actions button {
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.player-controls {
  grid-column: 2;
  display: flex;
  gap: 12px;
}

.player-controls button {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.player-controls .play-btn {
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
}

.hero-actions {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
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
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
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
  padding: 16px;
}

.service-card {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  font-size: 64px;
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
  gap: 12px;
  margin-top: auto;
}

.service-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-height: 90px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  text-align: left;
}

.service-pill span {
  font-size: 15px;
  font-weight: 700;
}

.service-pill small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.game-card {
  min-height: 500px;
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
  width: 150px;
  height: 150px;
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
  max-width: 280px;
  text-align: center;
}

.game-copy strong {
  display: block;
  margin-bottom: 12px;
  font-size: 34px;
}

.game-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.75;
}

.inline-link {
  padding: 0;
  background: transparent;
  color: #ff8a43;
  font-weight: 700;
}

@media (max-width: 1320px) {
  .board {
    grid-template-columns: 1fr 1fr;
  }

  .music-card {
    grid-column: 1 / -1;
  }

  .game-card {
    min-height: 420px;
  }
}

@media (max-width: 920px) {
  .console-frame {
    width: 100%;
    padding: 12px;
  }

  .topbar {
    flex-direction: column;
    padding: 16px;
  }

  .board,
  .service-grid {
    grid-template-columns: 1fr;
  }

  .music-card {
    grid-column: auto;
  }

  .search-box {
    width: 100%;
    flex-wrap: wrap;
    padding: 14px;
  }

  .search-box input {
    font-size: 20px;
  }

  .search-submit {
    width: 100%;
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

  .playlist-actions {
    grid-column: 1 / -1;
  }
}
</style>
