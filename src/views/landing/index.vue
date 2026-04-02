<template>
  <div class="social-home">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <section class="hero-shell">
      <header class="topbar">
        <div class="brand">
          <span class="brand-mark">Z</span>
          <div>
            <strong>{{ landing.productName }}</strong>
            <small>社交交友项目升级中</small>
          </div>
        </div>

        <div class="top-actions">
          <button type="button" class="ghost-btn" @click="goLogin">进入后台</button>
          <button type="button" class="primary-btn" @click="goRegister">立即体验</button>
        </div>
      </header>

      <main class="hero-grid">
        <article class="hero-main">
          <p class="eyebrow">Social Dating Platform</p>
          <h1>{{ landing.productName }}</h1>
          <p class="tagline">{{ landing.tagline }}</p>
          <p class="audience">{{ landing.audience }}</p>

          <div class="hero-actions">
            <button type="button" class="primary-btn" @click="goRegister">注册体验</button>
            <button type="button" class="ghost-btn" @click="goLogin">管理后台</button>
          </div>

          <div class="highlight-grid">
            <div v-for="feature in landing.features" :key="feature.title" class="highlight-card">
              <span class="highlight-badge">{{ feature.badge }}</span>
              <strong>{{ feature.title }}</strong>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </article>

        <aside class="hero-side">
          <section class="channel-panel">
            <div class="panel-head">
              <p>三端结构</p>
              <span>One Backend</span>
            </div>
            <div class="channel-list">
              <div v-for="channel in landing.channels" :key="channel.name" class="channel-card">
                <div class="channel-row">
                  <strong>{{ channel.name }}</strong>
                  <em>{{ channel.status }}</em>
                </div>
                <small>{{ channel.role }}</small>
                <p>{{ channel.description }}</p>
              </div>
            </div>
          </section>

          <section class="roadmap-panel">
            <div class="panel-head">
              <p>项目路线</p>
              <span>MVP</span>
            </div>
            <div class="roadmap-list">
              <div v-for="item in landing.roadmap" :key="item.stage" class="roadmap-item">
                <strong>{{ item.stage }}</strong>
                <p>{{ item.goal }}</p>
                <small>{{ item.status }}</small>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <section class="profiles-panel">
        <div class="panel-head profiles-head">
          <div>
            <p>Featured Profiles</p>
            <h2>首页资料卡</h2>
          </div>
          <span>已审核通过用户</span>
        </div>
        <div class="profile-grid">
          <article v-for="profile in profiles" :key="profile.profileId" class="profile-card">
            <div class="profile-avatar" :style="buildAvatarStyle(profile.avatarUrl)">
              <span v-if="!profile.avatarUrl">{{ profile.nickname?.slice(0, 1) || 'Z' }}</span>
            </div>
            <div class="profile-meta">
              <strong>{{ profile.nickname }}</strong>
              <small>{{ genderLabel(profile.gender) }} · {{ profile.cityCode || '城市待完善' }}</small>
              <em>{{ goalLabel(profile.relationshipGoal) }}</em>
              <p>{{ profile.profession || '职业待完善' }}</p>
              <p class="profile-bio">{{ profile.bio || '这个用户还在完善个人介绍。' }}</p>
            </div>
          </article>
          <article v-if="!profiles.length" class="profile-card empty-card">
            <div class="profile-meta">
              <strong>还没有已上架资料</strong>
              <p class="profile-bio">先去后台的“资料中心”录入几条审核通过的用户资料，首页这里就会自动展示。</p>
            </div>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getSocialLanding, getSocialPublicProfiles } from '@/api/social'

const router = useRouter()

const landing = reactive({
  productName: 'Zoumh Social',
  tagline: '让真实资料、双向匹配和安全审核成为交友产品的基础设施。',
  audience: '先聚焦城市年轻单身用户，通过小程序拉新、安卓端沉淀、后台运营提效。',
  channels: [],
  features: [],
  roadmap: []
})

const profiles = ref([])

function goLogin() {
  router.push('/login')
}

function goRegister() {
  router.push('/register')
}

function genderLabel(value) {
  if (value === 'M') {
    return '男生'
  }
  if (value === 'F') {
    return '女生'
  }
  return '未设置'
}

function goalLabel(value) {
  if (value === 'SERIOUS') {
    return '认真交往'
  }
  if (value === 'MAKE_FRIENDS') {
    return '先认识看看'
  }
  if (value === 'ACTIVITY') {
    return '同城活动'
  }
  return '交友中'
}

function buildAvatarStyle(url) {
  return url
    ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
}

onMounted(async () => {
  try {
    const response = await getSocialLanding()
    Object.assign(landing, response.data || {})
  } catch (error) {
    landing.channels = [
      { name: '后台管理端', role: '运营中台', status: '已接入', description: '负责审核、推荐位、活动与风控' },
      { name: '微信小程序', role: '拉新入口', status: '规划中', description: '用于快速注册、轻互动与分享传播' },
      { name: '安卓 App', role: '主使用端', status: '规划中', description: '用于推荐、匹配、聊天和会员权益' }
    ]
    landing.features = [
      { title: '真实资料卡', description: '资料审核、标签系统和交友目标构成核心身份页。', badge: 'Profile' },
      { title: '双向匹配', description: '喜欢与跳过并存，先匹配再深入互动。', badge: 'Match' },
      { title: '运营推荐流', description: '支持城市活动、主题推荐和用户分层运营。', badge: 'Growth' }
    ]
    landing.roadmap = [
      { stage: '第一阶段', goal: '完成项目换壳和运营骨架', status: '进行中' },
      { stage: '第二阶段', goal: '落资料、推荐、匹配能力', status: '待启动' }
    ]
  }

  try {
    const response = await getSocialPublicProfiles()
    profiles.value = response.data || []
  } catch (error) {
    profiles.value = []
  }
})
</script>

<style lang="scss" scoped>
.social-home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #fff4ee;
  background:
    radial-gradient(circle at top left, rgba(255, 215, 190, 0.16), transparent 26%),
    radial-gradient(circle at right 20%, rgba(122, 162, 255, 0.16), transparent 22%),
    linear-gradient(135deg, #20141b 0%, #512d3d 44%, #111722 100%);
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  opacity: 0.8;
  pointer-events: none;
}

.ambient-left {
  top: 4%;
  left: -120px;
  width: 340px;
  height: 340px;
  background: rgba(255, 170, 135, 0.22);
}

.ambient-right {
  right: -80px;
  bottom: 8%;
  width: 320px;
  height: 320px;
  background: rgba(130, 149, 255, 0.2);
}

.hero-shell {
  position: relative;
  z-index: 1;
  width: min(1380px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 22px 0 30px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;
  border-radius: 22px;
  background: rgba(14, 14, 20, 0.52);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff8b5d, #ffbf8a);
  color: #3a1724;
  font-size: 24px;
  font-weight: 800;
}

.brand strong,
.channel-row strong,
.roadmap-item strong,
.highlight-card strong {
  display: block;
}

.brand small,
.channel-card small,
.roadmap-item small {
  color: rgba(255, 244, 238, 0.65);
}

.top-actions,
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.ghost-btn {
  min-height: 46px;
  padding: 0 18px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, #ff8b5d, #ffb47a);
  color: #321521;
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #fff4ee;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  gap: 18px;
  margin-top: 18px;
}

.hero-main,
.channel-panel,
.roadmap-panel {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 20, 0.56);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
}

.hero-main {
  padding: 30px;
}

.eyebrow,
.panel-head p {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 244, 238, 0.62);
}

.hero-main h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 74px);
  line-height: 0.96;
}

.tagline {
  max-width: 680px;
  margin: 18px 0 0;
  font-size: 20px;
  line-height: 1.75;
  color: rgba(255, 244, 238, 0.92);
}

.audience {
  max-width: 640px;
  margin: 14px 0 0;
  line-height: 1.85;
  color: rgba(255, 244, 238, 0.68);
}

.hero-actions {
  margin-top: 24px;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.highlight-card,
.channel-card,
.roadmap-item {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
}

.highlight-card {
  padding: 18px;
}

.highlight-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 180, 122, 0.16);
  color: #ffd3b0;
  font-size: 12px;
  margin-bottom: 12px;
}

.highlight-card p,
.channel-card p,
.roadmap-item p {
  margin: 10px 0 0;
  color: rgba(255, 244, 238, 0.68);
  line-height: 1.75;
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.channel-panel,
.roadmap-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-head span,
.channel-row em {
  font-style: normal;
  color: #ffd3b0;
}

.channel-list,
.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.channel-card,
.roadmap-item {
  padding: 16px 18px;
}

.channel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.profiles-panel {
  margin-top: 18px;
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 20, 0.56);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
}

.profiles-head h2 {
  margin: 0;
  font-size: 28px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.profile-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
}

.profile-avatar {
  flex: 0 0 82px;
  width: 82px;
  height: 82px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 139, 93, 0.42), rgba(255, 191, 138, 0.2)),
    rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff4ee;
  font-size: 28px;
  font-weight: 800;
}

.profile-meta {
  min-width: 0;
}

.profile-meta strong {
  display: block;
  font-size: 20px;
}

.profile-meta small,
.profile-meta em,
.profile-bio {
  display: block;
}

.profile-meta small {
  margin-top: 6px;
  color: rgba(255, 244, 238, 0.68);
}

.profile-meta em {
  margin-top: 10px;
  font-style: normal;
  color: #ffd3b0;
}

.profile-meta p {
  margin: 10px 0 0;
  color: rgba(255, 244, 238, 0.68);
  line-height: 1.7;
}

.profile-bio {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.empty-card {
  grid-column: 1 / -1;
}

@media (max-width: 1080px) {
  .hero-grid,
  .highlight-grid,
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-shell {
    width: calc(100vw - 20px);
    padding-top: 10px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-main,
  .channel-panel,
  .roadmap-panel {
    padding: 22px 18px;
  }

  .hero-main h1 {
    font-size: 42px;
  }
}
</style>
