<!-- 订单管理页面 -->
<template>
    <div class="app-container">
        <!-- 搜索区域 -->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="订单编号" prop="orderNo">
                <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
                <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="套餐名称" prop="packageName">
                <el-input v-model="queryParams.packageName" placeholder="请输入套餐名称" clearable style="width: 200px" />
            </el-form-item>
            <el-form-item label="支付方式" prop="payType">
                <el-select v-model="queryParams.payType" placeholder="支付方式" clearable style="width: 200px">
                    <el-option v-for="dict in payTypeOptions" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="订单状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 200px">
                    <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="支付时间">
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
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['app:pay:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="mb8">
            <el-col :span="6">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>订单总数</span>
                        </div>
                    </template>
                    <div class="card-body">
                        {{ stats.totalCount || 0 }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>成功订单数</span>
                        </div>
                    </template>
                    <div class="card-body">
                        {{ stats.successCount || 0 }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>支付总金额</span>
                        </div>
                    </template>
                    <div class="card-body">
                        ¥{{ stats.totalAmount || 0 }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>支付用户数</span>
                        </div>
                    </template>
                    <div class="card-body">
                        {{ stats.userCount || 0 }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 表格区域 -->
        <el-table v-loading="loading" :data="orderList">
            <el-table-column label="订单ID" align="center" prop="id" />
            <el-table-column label="订单编号" align="center" prop="orderNo" />
            <el-table-column label="用户ID" align="center" prop="userId" />
            <el-table-column label="套餐名称" align="center" prop="packageName" />
            <el-table-column label="支付金额" align="center" prop="amount">
                <template #default="scope">
                    ¥{{ scope.row.amount }}
                </template>
            </el-table-column>
            <el-table-column label="支付方式" align="center" prop="payType">
                <template #default="scope">
                    <dict-tag :options="payTypeOptions" :value="scope.row.payType" />
                </template>
            </el-table-column>
            <el-table-column label="支付宝交易号" align="center" prop="tradeNo" />
            <el-table-column label="订单状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="statusOptions" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                    <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="支付时间" align="center" prop="payTime" width="180">
                <template #default="scope">
                    <span>{{ proxy.parseTime(scope.row.payTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" />
        </el-table>

        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
</template>

<script setup name="PayOrder">
import { listOrder, getOrderStats } from "@/api/appSys/order";

const { proxy } = getCurrentInstance();

// 遮罩层
const loading = ref(false);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 订单表格数据
const orderList = ref([]);
// 订单统计数据
const stats = ref({});
// 日期范围
const dateRange = ref([]);

// 支付方式数据字典
const payTypeOptions = ref([
    { label: '支付宝', value: '1' }
]);

// 订单状态数据字典
const statusOptions = ref([
    { label: '待支付', value: '0' },
    { label: '支付成功', value: '1' },
    { label: '支付失败', value: '2' },
    { label: '已退款', value: '3' }
]);

// 查询参数
const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    userId: undefined,
    packageName: undefined,
    payType: undefined,
    status: undefined
});

/** 查询订单列表 */
function getList() {
    loading.value = true;
    listOrder(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
        if (response.code === 200) {
            orderList.value = response.rows;
            total.value = response.total;
        } else {
            proxy.$modal.msgError(response.msg);
        }
        loading.value = false;
    }).catch(error => {
        console.error('获取订单列表失败:', error);
        loading.value = false;
        proxy.$modal.msgError("获取订单列表失败");
    });
}

/** 获取订单统计 */
function getStats() {
    getOrderStats().then(response => {
        console.log('订单统计响应:', response); // 添加日志
        if (response.code === 200) {
            stats.value = response.data || {};
        }
    }).catch(error => {
        console.error('获取订单统计失败:', error);
    });
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    dateRange.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/app/admin/pay/export', {
        ...queryParams.value,
        ...proxy.addDateRange(queryParams.value, dateRange.value)
    }, `order_${new Date().getTime()}.xlsx`);
}

// 页面加载时执行
onMounted(() => {
    getList();
    getStats();
});
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
