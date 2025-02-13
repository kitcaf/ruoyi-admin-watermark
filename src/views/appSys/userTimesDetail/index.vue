<!-- 使用记录管理页面 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="来源类型" prop="sourceType">
        <el-select v-model="queryParams.sourceType" placeholder="来源类型" clearable style="width: 200px">
          <el-option v-for="dict in sourceTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围" prop="timeRange">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="-" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['app:times:add']">新增次数</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['app:times:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['app:times:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格区域 -->
    <el-table v-loading="loading" :data="timesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="剩余次数" align="center" prop="times" />
      <el-table-column label="来源类型" align="center" prop="sourceType">
        <template #default="scope">
          <dict-tag :options="sourceTypeOptions" :value="scope.row.sourceType" />
        </template>
      </el-table-column>
      <el-table-column label="来源ID" align="center" prop="sourceId" />
      <el-table-column label="有效期截止时间" align="center" prop="expireTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['app:times:remove']">删除</el-button>
          <el-button type="text" icon="Promotion" @click="handleGrantDaily(scope.row)" v-hasPermi="['app:times:grant']"
            v-if="scope.row.sourceType === '1'">发放每日次数</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加次数对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="timesRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="增加次数" prop="times">
          <el-input-number v-model="form.times" :min="1" />
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-select v-model="form.sourceType" placeholder="请选择来源类型">
            <el-option v-for="dict in sourceTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源ID" prop="sourceId" v-if="form.sourceType !== '1'">
          <el-input v-model="form.sourceId" placeholder="请输入来源ID" />
        </el-form-item>
        <el-form-item label="有效期天数" prop="durationDays">
          <el-input-number v-model="form.durationDays" :min="1" />
        </el-form-item>
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

<script setup name="UserTimesDetail">
// 用户次数明细管理页面
import { listTimesDetail, getTimesDetail, addTimes, delTimesDetail, grantDailyTimes } from '@/api/appSys/userTimesDetail'

const { proxy } = getCurrentInstance()

// 遮罩层
const loading = ref(false)
// 选中数组
const ids = ref([])
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 用户次数明细表格数据
const timesList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)
// 日期范围
const dateRange = ref([])

// 来源类型数据字典
const sourceTypeOptions = ref([
  { label: '每日领取', value: '1' },
  { label: '套餐购买', value: '2' },
  { label: '激活码', value: '3' }
])

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  sourceType: undefined,
  beginTime: undefined,
  endTime: undefined
})

// 表单参数
const form = ref({})

// 表单校验规则
const rules = ref({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  times: [{ required: true, message: '次数不能为空', trigger: 'blur' }],
  sourceType: [{ required: true, message: '来源类型不能为空', trigger: 'change' }],
  durationDays: [{ required: true, message: '有效期天数不能为空', trigger: 'blur' }]
})

/** 查询用户次数明细列表 */
function getList() {
  loading.value = true
  listTimesDetail(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    timesList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    userId: undefined,
    times: 1,
    sourceType: undefined,
    sourceId: undefined,
    durationDays: 1
  }
  proxy.resetForm("timesRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加次数"
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["timesRef"].validate(valid => {
    if (valid) {
      addTimes(form.value).then(response => {
        proxy.$modal.msgSuccess("新增成功")
        open.value = false
        getList()
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const timesIds = row.id || ids.value
  proxy.$modal.confirm('是否确认删除用户次数明细编号为"' + timesIds + '"的数据项？').then(() => {
    delTimesDetail(timesIds).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    })
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('/app/admin/times/export', {
    ...queryParams.value
  }, `user_times_detail_${new Date().getTime()}.xlsx`)
}

/** 发放每日次数操作 */
function handleGrantDaily(row) {
  proxy.$modal.confirm('是否确认为用户"' + row.userId + '"发放每日次数？').then(() => {
    grantDailyTimes(row.userId).then(() => {
      getList()
      proxy.$modal.msgSuccess("发放成功")
    })
  })
}

getList()
</script>
