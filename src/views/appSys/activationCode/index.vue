<template>
    <div class="app-container">
        <!-- 搜索区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="激活码" prop="code">
                <el-input v-model="queryParams.code" placeholder="请输入激活码" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="激活码名称" prop="codeName">
                <el-input v-model="queryParams.codeName" placeholder="请输入激活码名称" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="激活码状态" clearable style="width: 200px">
                    <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 操作按钮区域 -->
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                    v-hasPermi="['app:code:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['app:code:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['app:code:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['app:code:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格区域 -->
        <el-table v-loading="loading" :data="codeList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="激活码ID" align="center" prop="id" />
            <el-table-column label="激活码" align="center" prop="code" />
            <el-table-column label="激活码名称" align="center" prop="codeName" />
            <el-table-column label="增加可使用次数" align="center" prop="usageTimes" />
            <el-table-column label="有效期天数" align="center" prop="durationDays" />
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="statusOptions" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="过期时间" align="center" prop="expireTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.expireTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="使用时间" align="center" prop="usedTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.usedTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180">
                <template #default="scope">
                    <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['app:code:edit']">修改</el-button>
                    <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['app:code:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="codeRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="激活码" prop="code">
                    <el-input v-model="form.code" placeholder="请输入激活码" />
                </el-form-item>
                <el-form-item label="激活码名称" prop="codeName">
                    <el-input v-model="form.codeName" placeholder="请输入激活码名称" />
                </el-form-item>
                <el-form-item label="增加可使用次数" prop="usageTimes">
                    <el-input-number v-model="form.usageTimes" :min="1" />
                </el-form-item>
                <el-form-item label="有效期天数" prop="durationDays">
                    <el-input-number v-model="form.durationDays" :min="1" />
                </el-form-item>
                <el-form-item label="过期时间" prop="expireTime">
                    <el-date-picker v-model="form.expireTime" type="datetime" placeholder="请选择过期时间"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
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

<script setup name="ActivationCode">
// 激活码控制页面
import { listCode, getCode, addCode, updateCode, delCode, changeCodeStatus } from '@/api/appSys/activateCode'

const { proxy } = getCurrentInstance()

// 遮罩层
const loading = ref(false)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 激活码表格数据
const codeList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 状态数据字典
const statusOptions = ref([
    { label: '未使用', value: '0' },
    { label: '已使用', value: '1' },
    { label: '已过期', value: '2' }
])

// 查询参数
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    code: undefined,
    codeName: undefined,
    status: undefined
})

// 表单参数
const form = ref({})

// 表单校验规则
const rules = ref({
    code: [{ required: true, message: '激活码不能为空', trigger: 'blur' }],
    codeName: [{ required: true, message: '激活码名称不能为空', trigger: 'blur' }],
    usageTimes: [{ required: true, message: '可使用次数不能为空', trigger: 'blur' }],
    durationDays: [{ required: true, message: '有效期天数不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

/** 查询激活码列表 */
function getList() {
    loading.value = true
    listCode(queryParams.value).then(response => {
        codeList.value = response.rows
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
        id: undefined,
        code: undefined,
        codeName: undefined,
        usageTimes: 1,
        durationDays: 1,
        status: '0'
    }
    proxy.resetForm("codeRef")
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加激活码"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const id = row.id || ids.value[0]
    getCode(id).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改激活码"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["codeRef"].validate(valid => {
        if (valid) {
            if (form.value.id) {
                updateCode(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addCode(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

/** 删除按钮操作 */
function handleDelete(row) {
    const codeIds = row.id || ids.value
    proxy.$modal.confirm('是否确认删除激活码编号为"' + codeIds + '"的数据项？').then(() => {
        delCode(codeIds).then(() => {
            getList()
            proxy.$modal.msgSuccess("删除成功")
        })
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/app/admin/code/export', {
        ...queryParams.value
    }, `activation_code_${new Date().getTime()}.xlsx`)
}

getList()
</script>
