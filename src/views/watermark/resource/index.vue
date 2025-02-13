<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="id" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类id" prop="cid">
        <el-select v-model="queryParams.cid" placeholder="请选择分类id" clearable>
          <el-option
            v-for="dict in category"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="主题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入主题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in watermark_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否为VIP" prop="isVip">
        <el-select v-model="queryParams.isVip" placeholder="请选择是否为VIP" clearable>
          <el-option
            v-for="dict in watermark_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否火" prop="isHot">
        <el-select v-model="queryParams.isHot" placeholder="请选择是否火" clearable>
          <el-option
            v-for="dict in watermark_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否分享" prop="canShare">
        <el-select v-model="queryParams.canShare" placeholder="请选择是否分享" clearable>
          <el-option
            v-for="dict in watermark_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="更新时间" prop="updatedDt">
        <el-date-picker clearable
          v-model="queryParams.updatedDt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择更新时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新" prop="updatedAt">
        <el-input
          v-model="queryParams.updatedAt"
          placeholder="请输入更新"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['watermark:resource:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['watermark:resource:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['watermark:resource:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['watermark:resource:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="resourceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id主键" align="center" prop="rid" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="分类id" align="center" prop="cid">
        <template #default="scope">
          <dict-tag :options="category" :value="scope.row.cid"/>
        </template>
      </el-table-column>
      <el-table-column label="封面图片" align="center" prop="cover" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.cover" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="主题" align="center" prop="title" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="watermark_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="是否为VIP" align="center" prop="isVip">
        <template #default="scope">
          <dict-tag :options="watermark_yes_no" :value="scope.row.isVip"/>
        </template>
      </el-table-column>
      <el-table-column label="是否火" align="center" prop="isHot">
        <template #default="scope">
          <dict-tag :options="watermark_yes_no" :value="scope.row.isHot"/>
        </template>
      </el-table-column>
      <el-table-column label="是否分享" align="center" prop="canShare">
        <template #default="scope">
          <dict-tag :options="watermark_yes_no" :value="scope.row.canShare"/>
        </template>
      </el-table-column>
      <el-table-column label="压缩资源" align="center" prop="zipUrl" />

      <el-table-column label="更新时间" align="center" prop="updatedDt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updatedDt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新" align="center" prop="updatedAt" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['watermark:resource:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['watermark:resource:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改资源管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="resourceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="id" prop="title">
          <el-input v-model="form.id" placeholder="请输入id" />
        </el-form-item>
        <el-form-item label="分类id" prop="cid">
          <el-select v-model="form.cid" placeholder="请选择分类id">
            <el-option
              v-for="dict in category"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片" prop="cover">
          <image-upload v-model="form.cover"/>
        </el-form-item>
        <el-form-item label="主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入主题" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in watermark_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否为VIP" prop="isVip">
          <el-radio-group v-model="form.isVip">
            <el-radio
              v-for="dict in watermark_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否火" prop="isHot">
          <el-radio-group v-model="form.isHot">
            <el-radio
              v-for="dict in watermark_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否分享" prop="canShare">
          <el-radio-group v-model="form.canShare">
            <el-radio
              v-for="dict in watermark_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="压缩资源" prop="zipUrl">
          <file-upload v-model="form.zipUrl"/>
        </el-form-item>

        <el-form-item label="更新时间" prop="updatedDt">
          <el-date-picker clearable
            v-model="form.updatedDt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择更新时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新" prop="updatedAt">
          <el-input v-model="form.updatedAt" placeholder="请输入更新" />
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

<script setup name="Resource">
import { listResource, getResource, delResource, addResource, updateResource } from "@/api/watermark/resource";

const { proxy } = getCurrentInstance();
const { watermark_status, category, watermark_yes_no } = proxy.useDict('watermark_status', 'category', 'watermark_yes_no');

const resourceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    cid: null,
    cover: null,
    title: null,
    status: null,
    isVip: null,
    isHot: null,
    canShare: null,
    zipUrl: null,
    demoUrl: null,
    editType: null,
    updatedDt: null,
    updatedAt: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询资源管理列表 */
function getList() {
  loading.value = true;
  listResource(queryParams.value).then(response => {
    resourceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    rid: null,
    id: null,
    cid: null,
    cover: null,
    title: null,
    status: null,
    isVip: null,
    isHot: null,
    canShare: null,
    zipUrl: null,
    demoUrl: null,
    editType: null,
    updatedDt: null,
    updatedAt: null
  };
  proxy.resetForm("resourceRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.rid);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加资源管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _rid = row.rid || ids.value
  getResource(_rid).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改资源管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["resourceRef"].validate(valid => {
    if (valid) {
      if (form.value.rid != null) {
        updateResource(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addResource(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _rids = row.rid || ids.value;
  proxy.$modal.confirm('是否确认删除资源管理编号为"' + _rids + '"的数据项？').then(function() {
    return delResource(_rids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('watermark/resource/export', {
    ...queryParams.value
  }, `resource_${new Date().getTime()}.xlsx`)
}

getList();
</script>
