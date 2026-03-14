<template>
  <div class="app-container hotel-monitor-page">
    <el-row :gutter="16" class="summary-row">
      <el-col v-for="card in summaryCards" :key="card.key" :xs="24" :sm="12" :lg="4">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-title">{{ card.title }}</div>
          <div class="summary-value">{{ overview[card.key] ?? 0 }}</div>
          <div class="summary-desc">{{ card.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-alert
      title="当前先接携程城市级采集。选择城市后会抓取首屏酒店列表、最低价、基础房型、床型、取消规则和支付方式。"
      type="info"
      :closable="false"
      show-icon
    />

    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch" label-width="72px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input v-model="queryParams.taskName" placeholder="请输入任务名称" clearable style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="城市" prop="cityName">
        <el-select v-model="queryParams.cityName" placeholder="请选择城市" clearable style="width: 180px">
          <el-option v-for="item in cityOptions" :key="item.code" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 160px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hotel:monitor:add']">新增任务</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['hotel:monitor:edit']">修改任务</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['hotel:monitor:remove']">删除任务</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getTaskList" />
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange" @row-click="handleSelectTask">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务名称" prop="taskName" min-width="160" />
      <el-table-column label="平台" width="90" align="center">
        <template #default="scope">
          <el-tag>{{ platformLabel(scope.row.platform) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="城市" prop="cityName" width="120" align="center" />
      <el-table-column label="入住/离店" min-width="180" align="center">
        <template #default="scope">
          <span>{{ scope.row.checkInDate }} 至 {{ scope.row.checkOutDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台酒店数" prop="platformHotelCount" width="110" align="center" />
      <el-table-column label="已采集酒店" prop="capturedHotelCount" width="110" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="statusTagMap[scope.row.status] || 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近采集" prop="lastCrawledAt" width="170" align="center" />
      <el-table-column label="错误信息" prop="lastErrorMessage" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="240" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Refresh" @click.stop="handleCrawl(scope.row)">立即采集</el-button>
          <el-button link type="primary" icon="View" @click.stop="handleSelectTask(scope.row)">查看结果</el-button>
          <el-button link type="primary" icon="Delete" @click.stop="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getTaskList"
    />

    <el-card shadow="never" class="snapshot-card">
      <template #header>
        <div class="card-header">
          <span>{{ currentTask ? `${currentTask.taskName} 的酒店快照` : '酒店快照' }}</span>
          <span class="subtle">{{ currentTask ? `${currentTask.cityName} · ${platformLabel(currentTask.platform)}` : '点击上方任务查看采集结果' }}</span>
        </div>
      </template>
      <el-empty v-if="!currentTask" description="请选择采集任务" />
      <el-table v-else v-loading="snapshotLoading" :data="snapshotList">
        <el-table-column label="酒店名称" prop="hotelName" min-width="180" />
        <el-table-column label="类型" prop="hotelType" width="100" align="center" />
        <el-table-column label="星级" prop="starLabel" width="90" align="center" />
        <el-table-column label="评分" prop="commentScore" width="90" align="center" />
        <el-table-column label="点评数" prop="reviewCount" width="110" align="center" />
        <el-table-column label="最低价" width="110" align="center">
          <template #default="scope">
            <span>{{ formatPrice(scope.row.minPrice, scope.row.currency) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="位置说明" prop="locationText" min-width="200" show-overflow-tooltip />
        <el-table-column label="采集时间" prop="crawledAt" width="170" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button link type="primary" icon="Tickets" @click="handleViewRooms(scope.row)">房型详情</el-button>
            <el-button link type="primary" icon="Link" @click="handleOpenHotel(scope.row)">打开携程</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="form.taskName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" placeholder="请选择平台">
                <el-option label="携程" value="ctrip" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="cityCode">
              <el-select v-model="form.cityCode" placeholder="请选择城市" @change="handleCityChange">
                <el-option v-for="item in cityOptions" :key="item.code" :label="item.name" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市名称">
              <el-input v-model="form.cityName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住日期" prop="checkInDate">
              <el-date-picker v-model="form.checkInDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="离店日期" prop="checkOutDate">
              <el-date-picker v-model="form.checkOutDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="记录采集用途。当前先抓携程首屏酒店和房型标签，后续再补翻页与详情页房价。" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="roomOpen" title="房型快照" size="520px">
      <el-empty v-if="roomList.length === 0" description="暂无房型数据" />
      <el-timeline v-else>
        <el-timeline-item v-for="item in roomList" :key="item.roomSnapshotId" placement="top">
          <div class="room-title">{{ item.roomName }}</div>
          <div class="room-meta">床型：{{ item.bedInfo || '--' }}</div>
          <div class="room-meta">早餐：{{ item.breakfastInfo || '--' }}</div>
          <div class="room-meta">取消：{{ item.cancelPolicy || '--' }}</div>
          <div class="room-meta">支付：{{ item.payType || '--' }}</div>
          <div class="room-meta">房量：{{ item.roomQuantity || '--' }}</div>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup name="HotelMonitor">
import {
  addCollectionTask,
  crawlCollectionTask,
  delCollectionTask,
  getCollectionOverview,
  getCollectionTask,
  listCollectionSnapshots,
  listCollectionTask,
  listRoomSnapshots,
  updateCollectionTask
} from '@/api/hotel/monitor'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const snapshotLoading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const roomOpen = ref(false)
const title = ref('')
const total = ref(0)
const taskList = ref([])
const snapshotList = ref([])
const roomList = ref([])
const currentTask = ref(null)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const overview = ref({ tasks: 0, running: 0, success: 0, failed: 0, hotels: 0, rooms: 0 })

const statusOptions = [
  { label: '待执行', value: 'pending' },
  { label: '执行中', value: 'running' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' }
]

const statusTagMap = {
  pending: 'info',
  running: 'warning',
  success: 'success',
  failed: 'danger'
}

const cityOptions = [
  { code: '2', name: '上海' },
  { code: '1', name: '北京' },
  { code: '32', name: '广州' },
  { code: '30', name: '深圳' },
  { code: '59', name: '杭州' },
  { code: '58', name: '南京' }
]

const summaryCards = [
  { key: 'tasks', title: '任务数', desc: '已配置城市采集任务' },
  { key: 'running', title: '执行中', desc: '当前后台正在采集' },
  { key: 'success', title: '成功任务', desc: '最近成功完成的任务' },
  { key: 'failed', title: '失败任务', desc: '需要排查的平台任务' },
  { key: 'hotels', title: '酒店快照', desc: '当前已落库酒店数' },
  { key: 'rooms', title: '房型快照', desc: '当前已落库房型数' }
]

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taskName: undefined,
    cityName: undefined,
    status: undefined
  },
  form: {},
  rules: {
    taskName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
    platform: [{ required: true, message: '平台不能为空', trigger: 'change' }],
    cityCode: [{ required: true, message: '城市不能为空', trigger: 'change' }],
    checkInDate: [{ required: true, message: '入住日期不能为空', trigger: 'change' }],
    checkOutDate: [{ required: true, message: '离店日期不能为空', trigger: 'change' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getTaskList() {
  loading.value = true
  listCollectionTask(queryParams.value).then(response => {
    taskList.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function getOverview() {
  getCollectionOverview().then(response => {
    overview.value = response.data || {}
  })
}

function getSnapshots(taskId) {
  snapshotLoading.value = true
  listCollectionSnapshots(taskId).then(response => {
    snapshotList.value = response.data || []
  }).finally(() => {
    snapshotLoading.value = false
  })
}

function reset() {
  form.value = {
    taskId: undefined,
    taskName: undefined,
    platform: 'ctrip',
    cityCode: '2',
    cityName: '上海',
    checkInDate: undefined,
    checkOutDate: undefined,
    status: 'pending',
    remark: undefined
  }
  proxy.resetForm('taskRef')
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getTaskList()
  getOverview()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.taskId)
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

function handleSelectTask(row) {
  currentTask.value = row
  getSnapshots(row.taskId)
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增城市采集任务'
}

function handleUpdate(row) {
  reset()
  const taskId = row?.taskId || ids.value[0]
  getCollectionTask(taskId).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改城市采集任务'
  })
}

function handleDelete(row) {
  const taskIds = row?.taskId ? [row.taskId] : ids.value
  proxy.$modal.confirm(`是否确认删除采集任务 "${taskIds.join(',')}"？`).then(() => {
    return delCollectionTask(taskIds.join(','))
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    if (currentTask.value && taskIds.includes(currentTask.value.taskId)) {
      currentTask.value = null
      snapshotList.value = []
    }
    getTaskList()
    getOverview()
  }).catch(() => {})
}

function handleCrawl(row) {
  proxy.$modal.confirm(`立即采集 ${row.cityName} 的携程酒店列表？`).then(() => {
    return crawlCollectionTask(row.taskId)
  }).then(() => {
    proxy.$modal.msgSuccess('采集已完成')
    handleQuery()
    handleSelectTask(row)
  }).catch(() => {})
}

function handleViewRooms(row) {
  listRoomSnapshots(row.snapshotId).then(response => {
    roomList.value = response.data || []
    roomOpen.value = true
  })
}

function handleOpenHotel(row) {
  if (row.hotelUrl) {
    window.open(row.hotelUrl, '_blank')
  }
}

function handleCityChange(value) {
  const city = cityOptions.find(item => item.code === value)
  form.value.cityName = city ? city.name : ''
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  proxy.$refs.taskRef.validate(valid => {
    if (!valid) {
      return
    }
    const request = form.value.taskId ? updateCollectionTask(form.value) : addCollectionTask(form.value)
    request.then(() => {
      proxy.$modal.msgSuccess(form.value.taskId ? '修改成功' : '新增成功')
      open.value = false
      handleQuery()
    })
  })
}

function formatPrice(value, currency) {
  if (value === null || value === undefined || value === '') {
    return '--'
  }
  return `${currency || 'CNY'} ${Number(value).toFixed(2)}`
}

function statusLabel(value) {
  const item = statusOptions.find(option => option.value === value)
  return item ? item.label : value || '未知'
}

function platformLabel(value) {
  return value === 'ctrip' ? '携程' : value
}

getOverview()
getTaskList()
</script>

<style lang="scss" scoped>
.hotel-monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  border-radius: 14px;

  .summary-title {
    color: #66768a;
    font-size: 13px;
  }

  .summary-value {
    margin-top: 8px;
    font-size: 30px;
    font-weight: 700;
    color: #153a63;
  }

  .summary-desc {
    margin-top: 6px;
    color: #7e8da3;
    font-size: 12px;
  }
}

.snapshot-card {
  margin-top: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-weight: 700;
}

.subtle {
  color: #7e8da3;
  font-weight: 400;
}

.room-title {
  font-size: 16px;
  font-weight: 700;
  color: #153a63;
}

.room-meta {
  margin-top: 6px;
  color: #6e8098;
}
</style>
