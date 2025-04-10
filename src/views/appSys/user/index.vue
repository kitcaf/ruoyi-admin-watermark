<!-- appUser管理页面 -->
<template>
    <div class="app-container">
        <!-- 搜索区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="设备ID" prop="deviceId">
                <el-input v-model="queryParams.deviceId" placeholder="请输入设备ID" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone">
                <el-input v-model="queryParams.phone" placeholder="请输入手机号码" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="用户类型" prop="userType">
                <el-select v-model="queryParams.userType" placeholder="用户类型" clearable style="width: 200px">
                    <el-option label="游客" value="0" />
                    <el-option label="正式用户" value="1" />
                </el-select>
            </el-form-item>
            <el-form-item label="会员状态" prop="isMember">
                <el-select v-model="queryParams.isMember" placeholder="会员状态" clearable style="width: 200px">
                    <el-option label="否" value="0" />
                    <el-option label="是" value="1" />
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
                    v-hasPermi="['app:user:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['app:user:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['app:user:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['app:user:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格区域 -->
        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="用户ID" align="center" prop="id" />
            <el-table-column label="设备ID" align="center" prop="deviceId" />
            <el-table-column label="用户昵称" align="center" prop="nickname" />
            <el-table-column label="头像" align="center" prop="avatar">
                <template #default="scope">
                    <el-avatar :size="40" :src="scope.row.avatar" />
                </template>
            </el-table-column>
            <el-table-column label="手机号码" align="center" prop="phone" />
            <el-table-column label="用户类型" align="center" prop="userType">
                <template #default="scope">
                    <dict-tag :options="userTypeOptions" :value="scope.row.userType" />
                </template>
            </el-table-column>
            <el-table-column label="会员状态" align="center" prop="isMember">
                <template #default="scope">
                    <dict-tag :options="memberOptions" :value="scope.row.isMember" />
                </template>
            </el-table-column>
            <el-table-column label="会员过期时间" align="center" prop="memberExpireTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.memberExpireTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="封禁状态" align="center" prop="delFlag">
                <template #default="scope">
                    <dict-tag :options="banOptions" :value="scope.row.delFlag" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="220">
                <template #default="scope">
                    <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['app:user:edit']">修改</el-button>
                    <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['app:user:remove']">删除</el-button>
                    <el-button type="text" :icon="scope.row.delFlag === '1' ? 'Unlock' : 'Lock'"
                        @click="handleBan(scope.row)" v-hasPermi="['app:user:edit']">
                        {{ scope.row.delFlag === '1' ? '解封' : '封禁' }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="userRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="设备ID" prop="deviceId">
                    <el-input v-model="form.deviceId" placeholder="请输入设备ID" />
                </el-form-item>
                <el-form-item label="用户昵称" prop="nickname">
                    <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
                </el-form-item>
                <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号码" />
                </el-form-item>
                <el-form-item label="用户类型" prop="userType">
                    <el-select v-model="form.userType" placeholder="请选择用户类型">
                        <el-option label="游客" value="0" />
                        <el-option label="正式用户" value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="会员状态" prop="isMember">
                    <el-select v-model="form.isMember" placeholder="请选择会员状态">
                        <el-option label="否" value="0" />
                        <el-option label="是" value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="会员过期时间" prop="memberExpireTime" v-if="form.isMember === '1'">
                    <el-date-picker v-model="form.memberExpireTime" type="datetime" placeholder="请选择会员过期时间" />
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

<script setup name="Index">
import { listUser, getUser, addUser, updateUser, delUser, banUser } from '@/api/appSys/user'

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
// 用户表格数据
const userList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 用户类型数据字典
const userTypeOptions = ref([
    { label: '游客', value: '0' },
    { label: '正式用户', value: '1' }
])

// 会员状态选项
const memberOptions = ref([
    { label: '非会员', value: '0' },
    { label: '会员', value: '1' }
])

// 封禁状态选项
const banOptions = ref([
    { label: '正常', value: '0' },
    { label: '已封禁', value: '1' }
])

// 查询参数
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    deviceId: undefined,
    phone: undefined,
    userType: undefined,
    isMember: undefined
})

// 表单参数
const form = ref({})

// 表单校验规则
const rules = ref({
    deviceId: [{ required: true, message: '设备ID不能为空', trigger: 'blur' }],
    nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    userType: [{ required: true, message: '用户类型不能为空', trigger: 'change' }]
})

/** 查询用户列表 */
function getList() {
    loading.value = true
    listUser(queryParams.value).then(response => {
        console.log("查询用户结果", response);
        userList.value = response.rows
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
        deviceId: undefined,
        nickname: undefined,
        avatar: undefined,
        phone: undefined,
        userType: undefined,
        isMember: '0',
        memberExpireTime: undefined
    }
    proxy.resetForm("userRef")
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    queryParams.value.userType = undefined;
    queryParams.value.isMember = undefined;
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
    title.value = "添加用户"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const id = row.id || ids.value[0]
    getUser(id).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改用户"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["userRef"].validate(valid => {
        if (valid) {
            if (form.value.id) {
                updateUser(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addUser(form.value).then(response => {
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
    const userIds = row.id || ids.value
    proxy.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(() => {
        delUser(userIds).then(() => {
            getList()
            proxy.$modal.msgSuccess("删除成功")
        })
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/app/admin/user/export', {
        ...queryParams.value
    }, `app_user_${new Date().getTime()}.xlsx`)
}

/** 封禁/解封处理函数 */
function handleBan(row) {
    const newStatus = row.delFlag === '1' ? '0' : '1'
    const text = newStatus === '1' ? '封禁' : '解封'
    proxy.$modal.confirm(`确认要${text}该用户吗？`).then(() => {
        banUser(row.id, newStatus).then(() => {
            getList()
            proxy.$modal.msgSuccess(text + "成功")
        }).catch(() => {
            proxy.$modal.msgError(text + "失败")
        })
    })
}

getList()
</script>

<style scoped lang="scss"></style>