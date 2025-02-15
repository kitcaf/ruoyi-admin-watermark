<!-- 套餐管理页面 -->
<template>
    <div class="app-container">
        <!-- 搜索区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="套餐名称" prop="packageName">
                <el-input v-model="queryParams.packageName" placeholder="请输入套餐名称" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="套餐类型" prop="packageType">
                <el-select v-model="queryParams.packageType" placeholder="套餐类型" clearable style="width: 200px">
                    <el-option v-for="dict in packageTypeOptions" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="套餐状态" clearable style="width: 200px">
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
                    v-hasPermi="['app:package:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['app:package:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['app:package:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['app:package:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格区域 -->
        <el-table v-loading="loading" :data="packageList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="套餐ID" align="center" prop="id" />
            <el-table-column label="套餐名称" align="center" prop="packageName" />
            <el-table-column label="套餐类型" align="center" prop="packageType">
                <template #default="scope">
                    <dict-tag :options="packageTypeOptions" :value="scope.row.packageType" />
                </template>
            </el-table-column>
            <el-table-column label="套餐价格" align="center" prop="price" />
            <el-table-column label="增加可使用次数" align="center" prop="usageTimes" />
            <el-table-column label="有效期天数" align="center" prop="durationDays" />
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                        @change="handleStatusChange(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180">
                <template #default="scope">
                    <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['app:package:edit']">修改</el-button>
                    <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['app:package:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="packageRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="套餐名称" prop="packageName">
                    <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
                </el-form-item>
                <el-form-item label="套餐类型" prop="packageType">
                    <el-select v-model="form.packageType" placeholder="请选择套餐类型">
                        <el-option v-for="dict in packageTypeOptions" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="套餐价格" prop="price">
                    <el-input-number v-model="form.price" :precision="2" :step="0.01" :min="0" />
                </el-form-item>
                <el-form-item label="可使用次数" prop="usageTimes">
                    <el-input-number v-model="form.usageTimes" :min="1" />
                </el-form-item>
                <el-form-item label="有效期天数" prop="durationDays">
                    <el-input-number v-model="form.durationDays" :min="1" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio label="0">正常</el-radio>
                        <el-radio label="1">停用</el-radio>
                    </el-radio-group>
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

<script setup name="MembershipPackage">
// 会员套餐管理页面
import { listPackage, getPackage, addPackage, updatePackage, delPackage, changePackageStatus } from '@/api/appSys/membershipPackage'

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
// 会员套餐表格数据
const packageList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 套餐类型数据字典
const packageTypeOptions = ref([
    { label: '连续包月', value: '1' },
    { label: '连续包年', value: '2' },
    { label: '终身会员', value: '3' },
    { label: '仅购买一个月', value: '4' }
])

// 状态数据字典
const statusOptions = ref([
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
])

// 查询参数
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    packageName: undefined,
    packageType: undefined,
    status: undefined
})

// 表单参数
const form = ref({})

// 表单校验规则
const rules = ref({
    packageName: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }],
    packageType: [{ required: true, message: '套餐类型不能为空', trigger: 'change' }],
    price: [{ required: true, message: '套餐价格不能为空', trigger: 'blur' }],
    usageTimes: [{ required: true, message: '可使用次数不能为空', trigger: 'blur' }],
    durationDays: [{ required: true, message: '有效期天数不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

/** 查询会员套餐列表 */
function getList() {
    loading.value = true
    listPackage(queryParams.value).then(response => {
        packageList.value = response.rows
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
        packageName: undefined,
        packageType: undefined,
        price: undefined,
        usageTimes: 1,
        durationDays: 1,
        status: '0'
    }
    proxy.resetForm("packageRef")
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
    title.value = "添加会员套餐"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const id = row.id || ids.value[0]
    getPackage(id).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改会员套餐"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["packageRef"].validate(valid => {
        if (valid) {
            if (form.value.id) {
                updatePackage(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addPackage(form.value).then(response => {
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
    const packageIds = row.id || ids.value
    proxy.$modal.confirm('是否确认删除会员套餐编号为"' + packageIds + '"的数据项？').then(() => {
        delPackage(packageIds).then(() => {
            getList()
            proxy.$modal.msgSuccess("删除成功")
        })
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/app/admin/package/export', {
        ...queryParams.value
    }, `membership_package_${new Date().getTime()}.xlsx`)
}

/** 状态修改 */
function handleStatusChange(row) {
    let text = row.status === "0" ? "启用" : "停用"
    proxy.$modal.confirm('确认要"' + text + '""' + row.packageName + '"会员套餐吗？').then(() => {
        changePackageStatus(row).then(() => {
            getList()
            proxy.$modal.msgSuccess(text + "成功")
        }).catch(() => {
            row.status = row.status === "0" ? "1" : "0"
        })
    }).catch(() => {
        row.status = row.status === "0" ? "1" : "0"
    })
}

getList()
</script>