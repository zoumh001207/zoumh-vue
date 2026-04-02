<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="城市" prop="cityCode">
        <el-input v-model="queryParams.cityCode" placeholder="请输入城市" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="交友目标" prop="relationshipGoal">
        <el-select v-model="queryParams.relationshipGoal" placeholder="请选择目标" clearable style="width: 180px">
          <el-option v-for="item in relationshipGoalOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="profileStatus">
        <el-select v-model="queryParams.profileStatus" placeholder="请选择状态" clearable style="width: 180px">
          <el-option v-for="item in profileStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="profileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="资料ID" align="center" prop="profileId" width="90" />
      <el-table-column label="用户ID" align="center" prop="userId" width="90" />
      <el-table-column label="昵称" align="center" prop="nickname" min-width="140" />
      <el-table-column label="性别" align="center" width="90">
        <template #default="scope">
          {{ getOptionLabel(genderOptions, scope.row.gender) }}
        </template>
      </el-table-column>
      <el-table-column label="城市" align="center" prop="cityCode" width="120" />
      <el-table-column label="交友目标" align="center" width="120">
        <template #default="scope">
          {{ getOptionLabel(relationshipGoalOptions, scope.row.relationshipGoal) }}
        </template>
      </el-table-column>
      <el-table-column label="实名" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.realVerified === 'Y' ? 'success' : 'info'">
            {{ scope.row.realVerified === 'Y' ? '已实名' : '未实名' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" width="110">
        <template #default="scope">
          <el-tag :type="getProfileStatusType(scope.row.profileStatus)">
            {{ getOptionLabel(profileStatusOptions, scope.row.profileStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="职业" align="center" prop="profession" min-width="140" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="profileRef" :model="form" :rules="rules" label-width="92px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户ID" prop="userId">
              <el-input-number v-model="form.userId" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别">
                <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="cityCode">
              <el-input v-model="form.cityCode" placeholder="如 shanghai" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="profession">
              <el-input v-model="form.profession" placeholder="请输入职业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交友目标" prop="relationshipGoal">
              <el-select v-model="form.relationshipGoal" placeholder="请选择目标">
                <el-option v-for="item in relationshipGoalOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实名状态" prop="realVerified">
              <el-radio-group v-model="form.realVerified">
                <el-radio value="Y">已实名</el-radio>
                <el-radio value="N">未实名</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核状态" prop="profileStatus">
              <el-radio-group v-model="form.profileStatus">
                <el-radio v-for="item in profileStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相册数" prop="albumCount">
              <el-input-number v-model="form.albumCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像地址" prop="avatarUrl">
              <el-input v-model="form.avatarUrl" placeholder="请输入头像 URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="个人介绍" prop="bio">
              <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="请输入个人介绍" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="运营备注" />
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
  </div>
</template>

<script setup name="SocialProfile">
import { addSocialProfile, delSocialProfile, getSocialProfile, listSocialProfile, updateSocialProfile } from '@/api/socialProfile'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const showSearch = ref(true)
const open = ref(false)
const title = ref('')
const total = ref(0)
const profileList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const genderOptions = [
  { label: '未知', value: 'U' },
  { label: '男', value: 'M' },
  { label: '女', value: 'F' }
]

const relationshipGoalOptions = [
  { label: '认真交往', value: 'SERIOUS' },
  { label: '先认识看看', value: 'MAKE_FRIENDS' },
  { label: '同城活动', value: 'ACTIVITY' }
]

const profileStatusOptions = [
  { label: '草稿', value: 'D' },
  { label: '通过', value: 'A' },
  { label: '驳回', value: 'R' }
]

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nickname: undefined,
    cityCode: undefined,
    relationshipGoal: undefined,
    profileStatus: undefined
  },
  form: {},
  rules: {
    userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
    nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
    gender: [{ required: true, message: '性别不能为空', trigger: 'change' }],
    relationshipGoal: [{ required: true, message: '交友目标不能为空', trigger: 'change' }],
    profileStatus: [{ required: true, message: '审核状态不能为空', trigger: 'change' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listSocialProfile(queryParams.value).then(response => {
    profileList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function reset() {
  form.value = {
    profileId: undefined,
    userId: undefined,
    nickname: '',
    gender: 'U',
    cityCode: '',
    profession: '',
    relationshipGoal: 'SERIOUS',
    avatarUrl: '',
    bio: '',
    albumCount: 0,
    realVerified: 'N',
    profileStatus: 'D',
    remark: ''
  }
  proxy.resetForm('profileRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.profileId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增社交资料'
}

function handleUpdate(row) {
  reset()
  const profileId = row.profileId || ids.value[0]
  getSocialProfile(profileId).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改社交资料'
  })
}

function submitForm() {
  proxy.$refs.profileRef.validate(valid => {
    if (!valid) {
      return
    }
    const request = form.value.profileId ? updateSocialProfile(form.value) : addSocialProfile(form.value)
    request.then(() => {
      proxy.$modal.msgSuccess(form.value.profileId ? '修改成功' : '新增成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const profileIds = row.profileId || ids.value
  proxy.$modal.confirm(`是否确认删除社交资料编号为"${profileIds}"的数据项？`).then(() => {
    return delSocialProfile(profileIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function getOptionLabel(options, value) {
  return options.find(item => item.value === value)?.label || value || '-'
}

function getProfileStatusType(value) {
  if (value === 'A') {
    return 'success'
  }
  if (value === 'R') {
    return 'danger'
  }
  return 'warning'
}

getList()
</script>
