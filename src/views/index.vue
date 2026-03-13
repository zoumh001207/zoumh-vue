<template>
  <div class="app-container home-dashboard">
    <section class="hero">
      <div>
        <h1>Zoumh 后台管理</h1>
        <p>统一管理配置中心、任务调度、权限体系与业务工具，支持本地联调与服务器部署。</p>
      </div>
      <el-tag type="success" effect="dark">运行中</el-tag>
    </section>

    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="item in kpis" :key="item.title">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-title">{{ item.title }}</div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-desc">{{ item.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :lg="14">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-title">核心服务</div>
          </template>
          <el-table :data="services" stripe>
            <el-table-column prop="name" label="服务" min-width="140" />
            <el-table-column prop="endpoint" label="访问地址" min-width="260" />
            <el-table-column label="状态" width="100">
              <template #default>
                <el-tag type="success" size="small">UP</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="10">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-title">近期任务</div>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="今日" type="primary">检查网关与认证服务状态</el-timeline-item>
            <el-timeline-item timestamp="本周" type="success">同步 Nacos 配置并做回归验证</el-timeline-item>
            <el-timeline-item timestamp="本月" type="warning">清理无效菜单与历史调试配置</el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const kpis = [
  { title: '系统版本', value: 'v3.6.7', desc: '当前前端构建版本' },
  { title: '环境', value: import.meta.env.MODE, desc: '当前运行模式' },
  { title: '基础接口', value: import.meta.env.VITE_APP_BASE_API || '/dev-api', desc: '前端 API 前缀' },
  { title: '品牌', value: 'Zoumh', desc: '统一后台管理门户' }
]

const services = [
  { name: 'Gateway', endpoint: `${import.meta.env.VITE_APP_BASE_API || '/prod-api'} -> gateway` },
  { name: 'Auth', endpoint: '/auth/** -> zoumh-auth' },
  { name: 'System', endpoint: '/system/** -> ruoyi-system' },
  { name: 'Gen', endpoint: '/code/** -> ruoyi-gen' },
  { name: 'Job', endpoint: '/schedule/** -> ruoyi-job' },
  { name: 'File', endpoint: '/file/** -> ruoyi-file' },
  { name: 'Monitor', endpoint: '/monitor/** -> ruoyi-monitor' }
]
</script>

<style lang="scss" scoped>
.home-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 14px;
  background: linear-gradient(120deg, rgba(15, 106, 216, 0.12), rgba(244, 183, 61, 0.12));
  border: 1px solid rgba(15, 106, 216, 0.18);

  h1 {
    margin: 0;
    font-size: 26px;
    color: #12345a;
  }

  p {
    margin: 8px 0 0;
    color: #486486;
  }
}

.kpi-card {
  border-radius: 12px;

  .kpi-title {
    color: #637a99;
    font-size: 13px;
  }

  .kpi-value {
    margin-top: 8px;
    font-size: 26px;
    font-weight: 700;
    color: #12345a;
    text-transform: uppercase;
  }

  .kpi-desc {
    margin-top: 4px;
    color: #7f94b1;
    font-size: 12px;
  }
}

.panel {
  border-radius: 12px;
}

.panel-title {
  font-weight: 700;
  color: #12345a;
}
</style>
