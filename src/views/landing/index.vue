<template>
  <div class="console-shell">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <section class="console-frame">
      <aside class="rail">
        <div class="brand">
          <span class="brand-mark"></span>
          <div>
            <p class="brand-name">Zoumh</p>
            <span class="brand-sub">Control Hub</span>
          </div>
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
          <article class="hero-card">
            <div class="hero-badges">
              <span class="live-badge">Live</span>
              <span class="scene-badge">Production</span>
            </div>

            <div class="hero-copy">
              <p class="eyebrow">SERVER OVERVIEW</p>
              <h1>专属控制首页</h1>
              <p>
                统一入口保留在首页，右上角直接进入登录或后台。
                当前文件上传、网关与基础服务已经恢复在线。
              </p>
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
            <div class="metric-value">6</div>
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

          <article class="panel-card metric-card warm-card">
            <div class="card-head">
              <div>
                <p class="card-kicker">Storage</p>
                <h3>文件系统</h3>
              </div>
              <span class="metric-badge">MinIO</span>
            </div>
            <div class="big-metric">Online</div>
            <p>头像、附件与文件回显已切回对象存储链路。</p>
            <button type="button" class="inline-link" @click="openInternal('/minio/')">进入对象存储</button>
          </article>

          <article class="panel-card metric-card">
            <div class="card-head">
              <div>
                <p class="card-kicker">Build</p>
                <h3>部署方式</h3>
              </div>
              <span class="metric-badge neutral">Docker</span>
            </div>
            <div class="mini-stats">
              <div>
                <strong>Frontend</strong>
                <span>宿主机 Nginx 分发</span>
              </div>
              <div>
                <strong>Backend</strong>
                <span>Jenkins 自动发布</span>
              </div>
            </div>
          </article>

          <article class="panel-card control-card">
            <div class="card-head">
              <div>
                <p class="card-kicker">Quick Access</p>
                <h3>常用操作</h3>
              </div>
            </div>
            <div class="control-actions">
              <button type="button" @click="openInternal('/jenkins/')">构建中心</button>
              <button type="button" @click="openInternal('/nacos/')">配置中心</button>
              <button type="button" @click="openInternal('/xxl-job-admin/')">任务中心</button>
              <button type="button" @click="openInternal('/seata/')">事务控制台</button>
            </div>
          </article>
        </section>
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getToken } from '@/utils/auth'

const router = useRouter()

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

const primaryLabel = computed(() => (getToken() ? '进入后台' : '直接登录'))
const profileInitial = computed(() => (getToken() ? 'A' : '→'))

function goPrimary() {
  router.push(getToken() ? '/index' : '/login')
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
</script>

<style lang="scss" scoped>
.console-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 119, 44, 0.12), transparent 30%),
    radial-gradient(circle at right center, rgba(255, 255, 255, 0.06), transparent 24%),
    linear-gradient(145deg, #2f3138 0%, #1d1f26 38%, #0a0b0f 100%);
  color: #f5f5f5;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  opacity: 0.8;
  pointer-events: none;
}

.ambient-left {
  top: 8%;
  left: -120px;
  width: 360px;
  height: 360px;
  background: rgba(255, 122, 43, 0.12);
}

.ambient-right {
  right: -80px;
  bottom: 12%;
  width: 300px;
  height: 300px;
  background: rgba(120, 128, 255, 0.14);
}

.console-frame {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 98px minmax(0, 1fr);
  gap: 22px;
  max-width: 1380px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 28px;
}

.rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 16px;
  border-radius: 34px;
  background: rgba(6, 7, 11, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff6b1c, #ff9448);
  box-shadow: 0 0 18px rgba(255, 107, 28, 0.45);
}

.brand-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.brand-sub {
  color: rgba(255, 255, 255, 0.46);
  font-size: 11px;
}

.rail-icons {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rail-btn {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.82);
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.rail-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 107, 28, 0.22);
}

.stage {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 18px;
  border-radius: 26px;
  background: rgba(10, 11, 15, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.28);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  min-width: 320px;
  padding: 0 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.46);
}

.search-icon {
  font-size: 20px;
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
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-weight: 700;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 6px 10px 6px 6px;
  border-radius: 18px;
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
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 18px;
}

.hero-card,
.panel-card {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 11, 15, 0.8);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.hero-card {
  position: relative;
  min-height: 420px;
  padding: 28px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(18, 20, 28, 0.26), rgba(8, 9, 12, 0.9)),
    radial-gradient(circle at 30% 25%, rgba(255, 178, 129, 0.28), transparent 28%),
    radial-gradient(circle at 68% 30%, rgba(83, 108, 255, 0.26), transparent 26%),
    linear-gradient(135deg, #34221b 0%, #181821 42%, #0a0b10 100%);
}

.hero-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.live-badge,
.scene-badge,
.metric-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
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

.hero-copy {
  max-width: 430px;
}

.eyebrow,
.card-kicker {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.54);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.hero-copy h1,
.card-head h3 {
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1.04;
}

.hero-copy p:last-child {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.85;
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
.control-actions button,
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
  padding: 22px;
}

.service-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.status-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 50%;
  background: #31d17c;
  box-shadow: 0 0 16px rgba(49, 209, 124, 0.7);
}

.metric-value {
  font-size: 58px;
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
}

.service-pill {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 6px;
  min-height: 84px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  text-align: left;
}

.service-pill span {
  font-weight: 700;
}

.service-pill small {
  color: rgba(255, 255, 255, 0.5);
}

.metric-card {
  min-height: 200px;
}

.warm-card {
  background:
    radial-gradient(circle at top right, rgba(255, 107, 28, 0.16), transparent 30%),
    rgba(10, 11, 15, 0.82);
}

.big-metric {
  margin-top: 28px;
  font-size: 46px;
  font-weight: 700;
}

.metric-card p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.8;
}

.inline-link {
  margin-top: 18px;
  padding: 0;
  background: transparent;
  color: #ff8a43;
  font-weight: 700;
}

.metric-badge.neutral {
  background: rgba(255, 255, 255, 0.06);
}

.mini-stats {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}

.mini-stats strong {
  display: block;
  margin-bottom: 6px;
  font-size: 24px;
}

.mini-stats span {
  color: rgba(255, 255, 255, 0.56);
}

.control-card {
  grid-column: span 2;
}

.control-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.control-actions button {
  min-height: 82px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .board {
    grid-template-columns: 1fr 1fr;
  }

  .hero-card,
  .control-card {
    grid-column: span 2;
  }
}

@media (max-width: 860px) {
  .console-frame {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .rail {
    flex-direction: row;
    align-items: center;
    gap: 18px;
  }

  .rail-icons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 0;
  }

  .top-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .board,
  .service-grid,
  .control-actions {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .control-card {
    grid-column: span 1;
  }

  .hero-actions {
    position: static;
    margin-top: 28px;
    flex-direction: column;
  }
}
</style>
