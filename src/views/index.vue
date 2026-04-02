<template>
  <div class="app-container social-console">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Social Console</p>
        <h1>{{ overview.productName }}</h1>
        <p class="hero-text">
          当前后台已经切到社交交友项目视角，后续会围绕资料审核、推荐策略、举报风控、
          小程序拉新和安卓主端持续扩展。
        </p>
      </div>
      <div class="hero-side">
        <span class="phase-badge">{{ overview.phase }}</span>
        <span class="env-chip">{{ envMode }}</span>
      </div>
    </section>

    <el-row :gutter="16">
      <el-col v-for="item in overview.metrics" :key="item.title" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-title">{{ item.title }}</div>
          <div class="metric-value">{{ item.value }}</div>
          <div class="metric-desc">{{ item.description }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :lg="14">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-title">运营模块优先级</div>
          </template>
          <div class="module-list">
            <div v-for="module in overview.modules" :key="module.name" class="module-item">
              <div>
                <strong>{{ module.name }}</strong>
                <p>{{ module.description }}</p>
              </div>
              <div class="module-meta">
                <el-tag effect="plain">{{ module.owner }}</el-tag>
                <el-tag type="warning">{{ module.status }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-title">项目路线</div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in overview.roadmap"
              :key="item.stage"
              :timestamp="item.stage"
              :type="item.status === '进行中' ? 'primary' : 'success'"
            >
              {{ item.goal }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel todo-panel" shadow="never">
      <template #header>
        <div class="panel-title">接下来直接做的事</div>
      </template>
      <div class="todo-list">
        <div v-for="item in overview.todoItems" :key="item" class="todo-item">
          {{ item }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { getSocialAdminOverview } from '@/api/social'

const overview = reactive({
  productName: 'Zoumh Social',
  phase: 'MVP 骨架阶段',
  metrics: [
    { title: '当前定位', value: '社交交友', description: '项目方向已切换' },
    { title: '管理端', value: '已接管', description: '后台先作为社交运营中台' },
    { title: '小程序', value: '待建设', description: '承接拉新和分享传播' },
    { title: '安卓 App', value: '待建设', description: '承接主业务使用链路' }
  ],
  modules: [],
  roadmap: [],
  todoItems: []
})

const envMode = import.meta.env.MODE

onMounted(async () => {
  try {
    const response = await getSocialAdminOverview()
    Object.assign(overview, response.data || {})
  } catch (error) {
    overview.modules = [
      { name: '用户资料中心', owner: '后端 + 审核后台', status: '优先级 P0', description: '管理头像、昵称、标签和审核状态' },
      { name: '推荐与匹配', owner: '推荐策略', status: '优先级 P0', description: '搭建喜欢、跳过、双向匹配能力' }
    ]
    overview.roadmap = [
      { stage: '骨架搭建', goal: '完成首页和后台换壳', status: '进行中' },
      { stage: '业务建模', goal: '补齐资料、推荐、举报模型', status: '待启动' }
    ]
    overview.todoItems = ['先完成接口骨架，再补菜单和 SQL 初始化']
  }
})
</script>

<style lang="scss" scoped>
.social-console {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at top left, rgba(255, 209, 187, 0.24), transparent 26%),
    linear-gradient(135deg, #9d3d2f 0%, #672e39 42%, #22283d 100%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.7;
}

.hero-copy h1 {
  margin: 0;
  font-size: 32px;
}

.hero-text {
  max-width: 720px;
  margin: 14px 0 0;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.84);
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.phase-badge,
.env-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.metric-card,
.panel {
  border-radius: 18px;
}

.metric-title {
  color: #7f6771;
  font-size: 13px;
}

.metric-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #4f2332;
}

.metric-desc {
  margin-top: 6px;
  color: #7e7980;
  line-height: 1.6;
}

.panel-row {
  margin-top: 2px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #4f2332;
}

.module-list,
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.module-item,
.todo-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #faf6f7;
}

.module-item p {
  margin: 8px 0 0;
  color: #7b6d74;
  line-height: 1.7;
}

.module-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  font-weight: 600;
  color: #5a3742;
}

@media (max-width: 960px) {
  .hero,
  .module-item {
    flex-direction: column;
  }

  .hero-side {
    align-items: flex-start;
  }
}
</style>
