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
              <span class="scene-badge">Guest Ready</span>
            </div>

            <div class="music-copy">
              <p class="eyebrow">Player Access</p>
              <h1>音乐播放器</h1>
              <p>
                现在不用登录也能直接搜歌、试听和播放。播放时会自动把当前试听音频下载到本地，
                收藏和歌单先保存在当前浏览器里。
              </p>
            </div>

            <div class="player-panel">
              <div class="cover-disc" :style="coverDiscStyle"></div>
              <div class="track-meta">
                <strong>{{ currentTrack.title }}</strong>
                <span>{{ currentTrack.artist }}</span>
                <small>{{ currentTrack.album || currentTrack.source }}</small>
              </div>

              <div class="music-search-row">
                <input
                  v-model="musicKeyword"
                  class="music-search-input"
                  type="text"
                  placeholder="全网搜索音乐，输入歌名或歌手"
                  @keyup.enter="searchMusic"
                />
                <button type="button" class="music-search-button" @click="searchMusic">
                  {{ musicLoading ? '搜索中' : '搜歌' }}
                </button>
              </div>

              <div class="progress-line">
                <i :style="{ width: `${progressPercent}%` }"></i>
              </div>

              <div class="playlist-actions">
                <button type="button" @click="toggleFavorite">
                  {{ isFavoriteCurrent ? '取消收藏' : '收藏' }}
                </button>
                <button type="button" @click="createPlaylist">创建歌单</button>
                <button type="button" @click="openPlaylistLibrary">歌单库 {{ playlists.length }}</button>
              </div>

              <div class="player-controls">
                <button type="button" @click="playPrevious">◁</button>
                <button type="button" class="play-btn" @click="togglePlay">
                  {{ isPlaying ? '❚❚' : '▶' }}
                </button>
                <button type="button" @click="playNext">▷</button>
              </div>

              <div class="search-result-list">
                <button
                  v-for="(track, index) in musicResults"
                  :key="`${track.id}-${index}`"
                  type="button"
                  class="track-chip"
                  :class="{ 'is-active': currentTrack.id === track.id }"
                  @click="selectTrack(track, index, true)"
                >
                  <span class="track-chip-title">{{ track.title }}</span>
                  <span class="track-chip-meta">{{ track.artist }} · {{ track.source }}</span>
                </button>
                <div v-if="!musicResults.length" class="track-chip empty-state">
                  <span class="track-chip-title">还没有搜索结果</span>
                  <span class="track-chip-meta">先输入歌名或歌手，播放器会在公开音乐源里帮你找试听。</span>
                </div>
              </div>
            </div>

            <div class="hero-actions">
              <button type="button" class="primary-action" @click="togglePlay">
                {{ isPlaying ? '暂停播放' : '立即播放' }}
              </button>
              <button type="button" class="secondary-action" @click="openCloudDrive">打开 CloudDrive</button>
            </div>

            <audio
              ref="audioRef"
              preload="none"
              @timeupdate="handleTimeUpdate"
              @loadedmetadata="handleLoadedMetadata"
              @ended="handleAudioEnded"
            ></audio>
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
                <p>这里先继续保留占位，后面你要接正式游戏模块时，直接在这块扩展就行。</p>
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
import { computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { searchPublicMusic, buildMusicAudioUrl } from '@/api/music'
import { getToken } from '@/utils/auth'
import ConsoleLoginModal from '@/components/ConsoleLoginModal.vue'
import ConsoleRegisterModal from '@/components/ConsoleRegisterModal.vue'

const router = useRouter()
const route = useRoute()
const audioRef = ref(null)
const aiKeyword = ref('')
const musicKeyword = ref('')
const musicLoading = ref(false)
const musicResults = ref([])
const currentIndex = ref(-1)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const favorites = ref(readStorage('landing-music-favorites'))
const playlists = ref(readStorage('landing-music-playlists'))
const downloadedTrackIds = ref(readSessionStorage('landing-music-downloaded'))
const currentTrack = reactive(buildDefaultTrack())

const services = [
  { name: 'CloudDrive', desc: '网盘管理', href: '/clouddrive/', external: true },
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
const progressPercent = computed(() => {
  if (!duration.value) {
    return 0
  }
  return Math.min(100, (currentTime.value / duration.value) * 100)
})
const coverDiscStyle = computed(() => (
  currentTrack.artwork
    ? { backgroundImage: `url(${currentTrack.artwork})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
))
const isFavoriteCurrent = computed(() => favorites.value.some(item => item.id === currentTrack.id))

function buildDefaultTrack() {
  return {
    id: 0,
    title: 'Neon Console',
    artist: '公开试听模式',
    album: '请输入歌名开始搜索',
    artwork: '',
    previewUrl: '',
    source: 'Apple Music'
  }
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    return []
  }
}

function readSessionStorage(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    return []
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function writeSessionStorage(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

function syncTrack(track) {
  currentTrack.id = track.id
  currentTrack.title = track.title
  currentTrack.artist = track.artist
  currentTrack.album = track.album
  currentTrack.artwork = track.artwork
  currentTrack.previewUrl = track.previewUrl
  currentTrack.source = track.source
}

function goPrimary() {
  if (getToken()) {
    router.push('/index')
    return
  }
  loginVisible.value = true
}

function openLink(item) {
  if (item.external) {
    window.open(item.href, '_blank')
    return
  }
  router.push(item.href)
}

function openCloudDrive() {
  window.open('/clouddrive/', '_blank')
}

async function searchMusic() {
  const keyword = musicKeyword.value.trim() || aiKeyword.value.trim()
  if (!keyword || musicLoading.value) {
    return
  }

  musicLoading.value = true
  try {
    const response = await searchPublicMusic(keyword)
    const tracks = response.data || []
    musicResults.value = tracks
    if (!tracks.length) {
      ElMessage.warning('没有找到可试听的音乐结果')
      return
    }
    selectTrack(tracks[0], 0, false)
    ElMessage.success(`找到 ${tracks.length} 首可试听歌曲`)
  } catch (error) {
    ElMessage.error('音乐搜索暂时不可用')
  } finally {
    musicLoading.value = false
  }
}

function selectTrack(track, index, autoplay) {
  currentIndex.value = index
  syncTrack(track)
  currentTime.value = 0
  duration.value = 0
  if (audioRef.value) {
    audioRef.value.src = buildMusicAudioUrl(track.previewUrl, `${track.artist}-${track.title}`, false)
    audioRef.value.load()
  }
  if (autoplay) {
    playCurrent()
  }
}

async function playCurrent() {
  if (!currentTrack.previewUrl) {
    if (musicKeyword.value.trim() || aiKeyword.value.trim()) {
      await searchMusic()
    } else {
      ElMessage.info('先输入歌名或歌手再开始播放')
    }
    return
  }

  if (!audioRef.value) {
    return
  }

  try {
    await audioRef.value.play()
    isPlaying.value = true
    triggerDownload(currentTrack)
  } catch (error) {
    ElMessage.error('当前歌曲暂时无法播放')
  }
}

function pauseCurrent() {
  if (!audioRef.value) {
    return
  }
  audioRef.value.pause()
  isPlaying.value = false
}

function togglePlay() {
  if (isPlaying.value) {
    pauseCurrent()
    return
  }
  playCurrent()
}

function playPrevious() {
  if (!musicResults.value.length) {
    ElMessage.info('先搜索歌曲，再使用上一曲')
    return
  }
  const nextIndex = currentIndex.value <= 0 ? musicResults.value.length - 1 : currentIndex.value - 1
  selectTrack(musicResults.value[nextIndex], nextIndex, true)
}

function playNext() {
  if (!musicResults.value.length) {
    ElMessage.info('先搜索歌曲，再使用下一曲')
    return
  }
  const nextIndex = currentIndex.value >= musicResults.value.length - 1 ? 0 : currentIndex.value + 1
  selectTrack(musicResults.value[nextIndex], nextIndex, true)
}

function triggerDownload(track) {
  if (!track.id || downloadedTrackIds.value.includes(track.id)) {
    return
  }
  downloadedTrackIds.value = [...downloadedTrackIds.value, track.id]
  writeSessionStorage('landing-music-downloaded', downloadedTrackIds.value)

  const link = document.createElement('a')
  link.href = buildMusicAudioUrl(track.previewUrl, `${track.artist}-${track.title}`, true)
  link.target = '_blank'
  link.rel = 'noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function toggleFavorite() {
  if (!currentTrack.id) {
    ElMessage.info('先选择一首歌')
    return
  }

  const exists = favorites.value.some(item => item.id === currentTrack.id)
  favorites.value = exists
    ? favorites.value.filter(item => item.id !== currentTrack.id)
    : [...favorites.value, { ...currentTrack }]
  writeStorage('landing-music-favorites', favorites.value)
  ElMessage.success(exists ? '已取消收藏' : '已加入收藏')
}

function createPlaylist() {
  if (!currentTrack.id) {
    ElMessage.info('先选中一首歌再建歌单')
    return
  }

  const name = window.prompt('输入歌单名称', `我的歌单 ${playlists.value.length + 1}`)
  if (!name || !name.trim()) {
    return
  }

  const cleanName = name.trim()
  const existing = playlists.value.find(item => item.name === cleanName)
  if (existing) {
    if (!existing.tracks.some(item => item.id === currentTrack.id)) {
      existing.tracks.push({ ...currentTrack })
    }
  } else {
    playlists.value = [...playlists.value, { name: cleanName, tracks: [{ ...currentTrack }] }]
  }

  writeStorage('landing-music-playlists', playlists.value)
  ElMessage.success(`已保存到歌单：${cleanName}`)
}

function openPlaylistLibrary() {
  if (!playlists.value.length) {
    ElMessage.info('还没有本地歌单')
    return
  }
  const content = playlists.value.map(item => `${item.name} · ${item.tracks.length} 首`).join(' | ')
  ElMessage.success(content)
}

function handleAiSearch() {
  const keyword = aiKeyword.value.trim()
  if (!keyword) {
    return
  }

  const service = services.find(item => item.name.toLowerCase().includes(keyword.toLowerCase()))
  if (service) {
    openLink(service)
    return
  }

  musicKeyword.value = keyword
  searchMusic()
}

function handleTimeUpdate() {
  if (!audioRef.value) {
    return
  }
  currentTime.value = audioRef.value.currentTime || 0
}

function handleLoadedMetadata() {
  if (!audioRef.value) {
    return
  }
  duration.value = audioRef.value.duration || 0
}

function handleAudioEnded() {
  isPlaying.value = false
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

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})

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
  min-height: calc(100vh - 38px);
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

.search-box input::placeholder,
.music-search-input::placeholder {
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
  gap: 10px;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 54px;
  padding: 7px 12px 7px 7px;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
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
  flex: 1;
  display: grid;
  grid-template-columns: 1.22fr 0.82fr 0.78fr;
  gap: 16px;
  min-height: 0;
}

.hero-card,
.panel-card {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 11, 15, 0.82);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.music-card {
  position: relative;
  min-height: 0;
  height: 100%;
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
  gap: 4px;
}

.track-meta strong {
  font-size: 18px;
}

.track-meta span,
.track-meta small {
  color: rgba(255, 255, 255, 0.56);
}

.track-meta small {
  font-size: 12px;
}

.music-search-row,
.progress-line,
.playlist-actions,
.player-controls,
.search-result-list {
  grid-column: 2;
}

.music-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  gap: 10px;
}

.music-search-input {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(7, 8, 12, 0.56);
  color: #fff;
  outline: none;
}

.music-search-button {
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b1c, #ff8b45);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.progress-line {
  height: 6px;
  margin-top: -4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-line i {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff6b1c, #ff9c56);
}

.playlist-actions {
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

.search-result-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 176px;
  overflow: auto;
  padding-right: 4px;
}

.track-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
  padding: 12px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.track-chip.is-active {
  background: linear-gradient(135deg, rgba(255, 107, 28, 0.28), rgba(255, 255, 255, 0.08));
}

.track-chip-title {
  font-size: 14px;
  font-weight: 700;
}

.track-chip-meta {
  color: rgba(255, 255, 255, 0.56);
  font-size: 12px;
  line-height: 1.5;
}

.empty-state {
  grid-column: 1 / -1;
  cursor: default;
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
  min-height: 0;
  height: 100%;
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
  min-height: 0;
  height: 100%;
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

@media (max-width: 1320px) {
  .board {
    grid-template-columns: 1fr 1fr;
    min-height: auto;
  }

  .music-card {
    grid-column: 1 / -1;
    min-height: 720px;
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
  .service-grid,
  .search-result-list {
    grid-template-columns: 1fr;
  }

  .music-card {
    grid-column: auto;
    min-height: 0;
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

  .music-search-row,
  .progress-line,
  .playlist-actions,
  .player-controls,
  .search-result-list {
    grid-column: 1 / -1;
  }
}
</style>
