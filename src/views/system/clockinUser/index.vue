<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="员工编号" prop="employeesId">
        <el-input
          v-model="queryParams.employeesId"
          placeholder="请输入员工编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="cts">
        <el-date-picker clearable
          v-model="queryParams.cts"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择创建时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="打卡日期" prop="day">
        <el-date-picker clearable
          v-model="queryParams.day"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择打卡日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="开始时间" prop="dkstartTs">
        <el-date-picker clearable
          v-model="queryParams.dkstartTs"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="dkendTs">
        <el-date-picker clearable
          v-model="queryParams.dkendTs"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="是否迟到" prop="isLate">
        <el-select v-model="queryParams.isLate" placeholder="请选择是否迟到" clearable>
          <el-option
            v-for="dict in dict.type.is_late"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否早退" prop="leaveEarly">
        <el-select v-model="queryParams.leaveEarly" placeholder="请选择是否早退" clearable>
          <el-option
            v-for="dict in dict.type.leave_early"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:clockin:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:clockin:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:clockin:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:clockin:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="clockinList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="打卡编号" align="center" prop="id" />
      <el-table-column label="员工编号" align="center" prop="employeesId" />
      <el-table-column label="创建时间" align="center" prop="cts" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.cts, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="打卡日期" align="center" prop="day" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.day, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="dkstartTs" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dkstartTs, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="dkendTs" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dkendTs, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否迟到" align="center" prop="isLate">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.is_late" :value="scope.row.isLate"/>
        </template>
      </el-table-column>
      <el-table-column label="是否早退" align="center" prop="leaveEarly">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.leave_early" :value="scope.row.leaveEarly"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:clockin:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:clockin:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改打卡信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="创建时间" prop="cts">
          <el-date-picker clearable
            v-model="form.cts"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="打卡日期" prop="day">
          <el-date-picker clearable
            v-model="form.day"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择打卡日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间" prop="dkstartTs">
          <el-date-picker clearable
            v-model="form.dkstartTs"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dkendTs">
          <el-date-picker clearable
            v-model="form.dkendTs"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否迟到" prop="isLate">
          <el-select v-model="form.isLate" placeholder="请选择是否迟到">
            <el-option
              v-for="dict in dict.type.is_late"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否早退" prop="leaveEarly">
          <el-select v-model="form.leaveEarly" placeholder="请选择是否早退">
            <el-option
              v-for="dict in dict.type.leave_early"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listClockin, getClockin, delClockin, addClockin, updateClockin } from "@/api/system/clockin";

export default {
  name: "index",
  dicts: ['is_late', 'leave_early'],
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
      // 打卡信息表格数据
      clockinList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        employeesId: null,
        cts: null,
        day: null,
        dkstartTs: null,
        dkendTs: null,
        isLate: null,
        leaveEarly: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        employeesId: [
          { required: true, message: "员工编号不能为空", trigger: "blur" }
        ],
        cts: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        day: [
          { required: true, message: "打卡日期不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    const userId = this.$route.params.userId;
    this.queryParams.employeesId = userId
    console.log(userId)
    this.getList();
  },
  methods: {
    /** 查询打卡信息列表 */
    getList() {
      this.loading = true;
      listClockin(this.queryParams).then(response => {
        this.clockinList = response.rows;
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
        id: null,
        employeesId: null,
        cts: null,
        day: null,
        dkstartTs: null,
        dkendTs: null,
        isLate: null,
        leaveEarly: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加打卡信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getClockin(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改打卡信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateClockin(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClockin(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除打卡信息编号为"' + ids + '"的数据项？').then(function() {
        return delClockin(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/clockin/export', {
        ...this.queryParams
      }, `clockin_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
