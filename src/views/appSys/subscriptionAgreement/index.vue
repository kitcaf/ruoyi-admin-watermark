<template>
    <div class="app-container">
        <!-- 搜索区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="用户ID" prop="userId">
                <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="协议号" prop="agreementNo">
                <el-input v-model="queryParams.agreementNo" placeholder="请输入支付宝协议号" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="协议状态" clearable style="width: 200px">
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
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['app:agreement:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 统计卡片 -->
        <!-- <el-row :gutter="20" class="mb8">
            <el-col :span="6" v-for="(item, index) in statsCards" :key="index">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>{{ item.title }}</span>
                        </div>
                    </template>
<div class="card-body">
    {{ item.prefix || '' }}{{ stats[item.key] || 0 }}{{ item.suffix || '' }}
</div>
</el-card>
</el-col>
</el-row> -->

        <!-- 表格区域 -->
        <el-table v-loading="loading" :data="agreementList">
            <el-table-column label="协议ID" align="center" prop="id" />
            <el-table-column label="用户ID" align="center" prop="userId" />
            <el-table-column label="套餐ID" align="center" prop="packageId" />
            <el-table-column label="支付宝协议号" align="center" prop="agreementNo" />
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="statusOptions" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="下次扣款时间" align="center" prop="nextExecuteTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.nextExecuteTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="累计扣款金额" align="center" prop="totalAmount">
                <template #default="scope">
                    ¥{{ scope.row.totalAmount }}
                </template>
            </el-table-column>
            <el-table-column label="扣款次数" align="center" prop="totalCount" />
            <el-table-column label="备注" align="center" prop="remark" />
        </el-table>

        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
</template>

<script setup name="SubscriptionAgreement">
import { listAgreement } from "@/api/appSys/subscriptionAgreement";

const { proxy } = getCurrentInstance();
const { parseTime } = proxy.useDict();

// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 协议表格数据
const agreementList = ref([]);
// 协议统计数据
const stats = ref({});
// 统计卡片配置
const statsCards = ref([
    { title: '总协议数', key: 'totalCount' },
    { title: '生效协议数', key: 'activeCount' },
    { title: '累计扣款金额', key: 'totalAmount', prefix: '¥' },
    { title: '累计扣款次数', key: 'deductCount' }
]);

// 协议状态选项
const statusOptions = ref([
    { label: '已签约（首次支付中）', value: '0' },
    { label: '生效中', value: '1' },
    { label: '已终止', value: '2' },
    { label: '协议创建中', value: '3' }
]);

// 查询参数
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    agreementNo: undefined,
    status: undefined
});

/** 查询协议列表 */
function getList() {
    loading.value = true;
    listAgreement(queryParams.value).then(response => {
        agreementList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}


/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/app/admin/agreement/export', {
        ...queryParams.value
    }, `subscription_agreement_${new Date().getTime()}.xlsx`);
}

getList();
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-body {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    color: #409EFF;
}
</style>