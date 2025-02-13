<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="Logo名称" prop="logoName">
        <el-input
          v-model="queryParams.logoName"
          placeholder="请输入Logo名称"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Logo状态"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          @click="handleQuery"
          >搜索</el-button
        >
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
          v-hasPermi="['app:brandlogo:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['app:brandlogo:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['app:brandlogo:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['app:brandlogo:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="logoList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Logo ID" align="center" prop="id" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="Logo名称" align="center" prop="logoName" />
      <el-table-column label="Logo图片" align="center" prop="logoUrl">
        <template #default="scope">
          <image-preview :src="scope.row.logoUrl" :width="160" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['app:brandlogo:edit']"
            >修改</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['app:brandlogo:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改品牌Logo对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="logoRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="Logo名称" prop="logoName">
          <el-input v-model="form.logoName" placeholder="请输入Logo名称" />
        </el-form-item>
        <el-form-item label="Logo图片" prop="logoUrl">
          <el-input v-model="form.logoUrl" placeholder="请输入Logo图片URL" />
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

<script>
import {
  listBrandLogo,
  getBrandLogo,
  delBrandLogo,
  addBrandLogo,
  updateBrandLogo,
  changeBrandLogoStatus,
} from "@/api/watermark/customer";

export default {
  name: "BrandLogo",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // Logo列表数据
      logoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        logoName: undefined,
        userId: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
        logoName: [{ required: true, message: 'Logo名称不能为空', trigger: 'blur' }],
        logoUrl: [{ required: true, message: 'Logo图片URL不能为空', trigger: 'blur' }]
      },
      // 状态数据字典
      statusOptions: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询品牌Logo列表 */
    getList() {
      this.loading = true;
      listBrandLogo(this.queryParams).then((response) => {
        this.logoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        userId: undefined,
        logoName: undefined,
        logoUrl: undefined,
        status: "0"
      };
      this.resetForm("logoRef");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryRef");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加品牌Logo";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getBrandLogo(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改品牌Logo";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["logoRef"].validate((valid) => {
        if (valid) {
          if (this.form.id) {
            updateBrandLogo(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBrandLogo(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const logoIds = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除品牌Logo编号为"' + logoIds + '"的数据项？')
        .then(() => {
          return delBrandLogo(logoIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "app/admin/brandLogo/export",
        {
          ...this.queryParams,
        },
        `brand_logo_${new Date().getTime()}.xlsx`
      );
    },
    /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal
        .confirm('确认要"' + text + '""' + row.logoName + '"品牌Logo吗？')
        .then(() => {
          return changeBrandLogoStatus(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess(text + "成功");
        })
        .catch(() => {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
  },
};
</script>
