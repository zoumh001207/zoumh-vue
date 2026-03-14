<template>
  <div class="app-container hotel-monitor-page">
    <el-row :gutter="16" class="summary-row">
      <el-col v-for="card in summaryCards" :key="card.key" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-title">{{ card.title }}</div>
          <div class="summary-value">{{ overview[card.key] ?? 0 }}</div>
          <div class="summary-desc">{{ card.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="酒店名称" prop="hotelName">
        <el-input v-model="queryParams.hotelName" placeholder="请输入酒店名称" clearable style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="监控平台" prop="platform">
        <el-select v-model="queryParams.platform" placeholder="请选择平台" clearable style="width: 180px">
          <el-option v-for="item in platformOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input v-model="queryParams.city" placeholder="请输入城市" clearable style="width: 180px" @keyup.enter="handleQuery" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hotel:monitor:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['hotel:monitor:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['hotel:monitor:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="monitorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="酒店" align="center" prop="hotelName" min-width="160" />
      <el-table-column label="平台" align="center" prop="platform" width="120" />
      <el-table-column label="城市" align="center" prop="city" width="120" />
      <el-table-column label="房型" align="center" prop="roomType" min-width="140" show-overflow-tooltip />
      <el-table-column label="入住/离店" align="center" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.checkInDate }} 至 {{ scope.row.checkOutDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目标价" align="center" width="120">
        <template #default="scope">
          <span>{{ formatPrice(scope.row.targetPrice, scope.row.currency) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前价" align="center" width="120">
        <template #default="scope">
          <span>{{ formatPrice(scope.row.currentPrice, scope.row.currency) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近波动" align="center" width="120">
        <template #default="scope">
          <span :class="changeClass(scope.row.latestChange)">{{ formatChange(scope.row.latestChange, scope.row.currency) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="110">
        <template #default="scope">
          <el-tag :type="statusTagMap[scope.row.status] || 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近检查" align="center" prop="lastCheckedTime" width="180" />
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Histogram" @click="handleViewHistory(scope.row)" v-hasPermi="['hotel:monitor:query']">价格记录</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['hotel:monitor:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['hotel:monitor:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="monitorRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="酒店名称" prop="hotelName">
              <el-input v-model="form.hotelName" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监控平台" prop="platform">
              <el-select v-model="form.platform" placeholder="请选择平台">
                <el-option v-for="item in platformOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房型" prop="roomType">
              <el-input v-model="form.roomType" placeholder="请输入房型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入住日期" prop="checkInDate">
              <el-date-picker v-model="form.checkInDate" type="date" value-format="YYYY-MM-DD" placeholder="选择入住日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="离店日期" prop="checkOutDate">
              <el-date-picker v-model="form.checkOutDate" type="date" value-format="YYYY-MM-DD" placeholder="选择离店日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标价格" prop="targetPrice">
              <el-input-number v-model="form.targetPrice" :precision="2" :min="0.01" :step="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前价格" prop="currentPrice">
              <el-input-number v-model="form.currentPrice" :precision="2" :min="0" :step="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="form.currency" placeholder="请选择币种">
                <el-option v-for="item in currencyOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监控状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="渠道链接" prop="channelUrl">
              <el-input v-model="form.channelUrl" placeholder="请输入详情链接" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最近检查" prop="lastCheckedTime">
              <el-date-picker v-model="form.lastCheckedTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择最近检查时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格提醒" prop="notifyEnabled">
              <el-radio-group v-model="form.notifyEnabled">
                <el-radio value="Y">开启</el-radio>
                <el-radio value="N">关闭</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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

    <el-drawer v-model="historyOpen" title="价格记录" size="520px">
      <div class="history-header">
        <div class="history-title">{{ currentHistoryTitle }}</div>
        <el-tag type="info">{{ historyList.length }} 条</el-tag>
      </div>
      <el-empty v-if="historyList.length === 0" description="暂无记录" />
      <el-timeline v-else>
        <el-timeline-item v-for="item in historyList" :key="item.historyId" :timestamp="item.observedAt" placement="top">
          <div class="history-price">{{ formatPrice(item.observedPrice, historyCurrency) }}</div>
          <div class="history-meta">
            <span :class="changeClass(item.changeAmount)">{{ formatChange(item.changeAmount, historyCurrency) }}</span>
            <span>{{ statusLabel(item.availability) }}</span>
          </div>
          <div class="history-note">{{ item.sourceNote || '价格检查记录' }}</div>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup name="HotelMonitor">
import {
  addHotelMonitor,
  delHotelMonitor,
  getHotelMonitor,
  getHotelMonitorHistory,
  getHotelMonitorOverview,
  listHotelMonitor,
  updateHotelMonitor
} from '@/api/hotel/monitor'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const historyOpen = ref(false)
const title = ref('')
const total = ref(0)
const monitorList = ref([])
const historyList = ref([])
const currentHistoryTitle = ref('')
const historyCurrency = ref('CNY')
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const overview = ref({
  total: 0,
  tracking: 0,
  alerted: 0,
  paused: 0,
  targetReached: 0
})

const statusOptions = [
  { label: '监控中', value: 'tracking' },
  { label: '已触达', value: 'alerted' },
  { label: '已暂停', value: 'paused' },
  { label: '已结束', value: 'closed' }
]

const statusTagMap = {
  tracking: 'primary',
  alerted: 'success',
  paused: 'warning',
  closed: 'info'
}

const platformOptions = ['美团', '携程', '飞猪', 'Booking', 'Agoda', '同程', '人工录入']
const currencyOptions = ['CNY', 'HKD', 'USD', 'JPY']

const summaryCards = [
  { key: 'total', title: '监控总数', desc: '当前已录入任务' },
  { key: 'tracking', title: '监控中', desc: '持续观察价格波动' },
  { key: 'alerted', title: '已触达', desc: '当前价格已达到目标' },
  { key: 'targetReached', title: '可下单', desc: '当前价格不高于目标价' }
]

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    hotelName: undefined,
    platform: undefined,
    city: undefined,
    status: undefined
  },
  form: {},
  rules: {
    hotelName: [{ required: true, message: '酒店名称不能为空', trigger: 'blur' }],
    platform: [{ required: true, message: '监控平台不能为空', trigger: 'change' }],
    checkInDate: [{ required: true, message: '入住日期不能为空', trigger: 'change' }],
    checkOutDate: [{ required: true, message: '离店日期不能为空', trigger: 'change' }],
    targetPrice: [{ required: true, message: '目标价格不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listHotelMonitor(queryParams.value).then(response => {
    monitorList.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function getOverview() {
  getHotelMonitorOverview().then(response => {
    overview.value = response.data || {}
  })
}

function reset() {
  form.value = {
    monitorId: undefined,
    hotelName: undefined,
    platform: '携程',
    city: undefined,
    roomType: undefined,
    checkInDate: undefined,
    checkOutDate: undefined,
    targetPrice: undefined,
    currentPrice: undefined,
    currency: 'CNY',
    channelUrl: undefined,
    status: 'tracking',
    lastCheckedTime: undefined,
    notifyEnabled: 'Y',
    remark: undefined
  }
  proxy.resetForm('monitorRef')
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
  getOverview()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.monitorId)
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增酒店价格监控'
}

function handleUpdate(row) {
  reset()
  const monitorId = row?.monitorId || ids.value[0]
  getHotelMonitor(monitorId).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改酒店价格监控'
  })
}

function handleDelete(row) {
  const monitorIds = row?.monitorId ? [row.monitorId] : ids.value
  proxy.$modal.confirm(`是否确认删除监控编号为 "${monitorIds.join(',')}" 的任务？`).then(() => {
    return delHotelMonitor(monitorIds.join(','))
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
    getOverview()
  }).catch(() => {})
}

function handleViewHistory(row) {
  currentHistoryTitle.value = `${row.hotelName} · ${row.platform}`
  historyCurrency.value = row.currency || 'CNY'
  getHotelMonitorHistory(row.monitorId).then(response => {
    historyList.value = response.data || []
    historyOpen.value = true
  })
}

function cancel() {
  open.value = false
  reset()
}

function submitForm() {
  proxy.$refs.monitorRef.validate(valid => {
    if (!valid) {
      return
    }
    const request = form.value.monitorId ? updateHotelMonitor(form.value) : addHotelMonitor(form.value)
    request.then(() => {
      proxy.$modal.msgSuccess(form.value.monitorId ? '修改成功' : '新增成功')
      open.value = false
      getList()
      getOverview()
    })
  })
}

function formatPrice(value, currency) {
  if (value === null || value === undefined || value === '') {
    return '--'
  }
  return `${currency || 'CNY'} ${Number(value).toFixed(2)}`
}

function formatChange(value, currency) {
  if (value === null || value === undefined) {
    return '--'
  }
  const amount = Number(value)
  const prefix = amount > 0 ? '+' : ''
  return `${prefix}${currency || 'CNY'} ${amount.toFixed(2)}`
}

function changeClass(value) {
  const amount = Number(value || 0)
  if (amount < 0) {
    return 'price-down'
  }
  if (amount > 0) {
    return 'price-up'
  }
  return 'price-flat'
}

function statusLabel(value) {
  const item = statusOptions.find(option => option.value === value)
  return item ? item.label : value || '未知'
}

getOverview()
getList()
</script>

<style lang="scss" scoped>
.hotel-monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  margin-bottom: 4px;
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

.price-up {
  color: #d03050;
}

.price-down {
  color: #1f9d55;
}

.price-flat {
  color: #76879b;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.history-title {
  font-size: 16px;
  font-weight: 700;
  color: #153a63;
}

.history-price {
  font-size: 18px;
  font-weight: 700;
  color: #153a63;
}

.history-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #6e8098;
}

.history-note {
  margin-top: 6px;
  color: #8a98aa;
}
</style>
