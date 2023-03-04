<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <!--      <el-form-item label="员工编号" prop="employeesId">-->
      <!--        <el-input-->
      <!--          v-model="queryParams.employeesId"-->
      <!--          placeholder="请输入员工编号"-->
      <!--          clearable-->
      <!--          @keyup.enter.native="handleQuery"-->
      <!--        />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="创建时间" prop="cts">-->
      <!--        <el-date-picker clearable-->
      <!--                        v-model="queryParams.cts"-->
      <!--                        type="date"-->
      <!--                        value-format="yyyy-MM-dd"-->
      <!--                        placeholder="请选择创建时间">-->
      <!--        </el-date-picker>-->
      <!--      </el-form-item>-->
      <el-form-item label="排班日期">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-M-d"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <!--      <el-form-item label="打卡日期" prop="day">-->
      <!--        <el-date-picker clearable-->
      <!--                        v-model="queryParams.day"-->
      <!--                        type="date"-->
      <!--                        value-format="yyyy-M-d"-->
      <!--                        placeholder="请选择打卡日期">-->
      <!--        </el-date-picker>-->
      <!--      </el-form-item>-->
      <el-form-item label="上班时间" prop="dkstartTs">
        <!--        <el-time-select-->
        <!--          v-model="queryParams.dkstartTs"-->
        <!--          :picker-options="{-->
        <!--                start: '08:00',-->
        <!--                step: '00:15',-->
        <!--                end: '18:30'-->
        <!--              }"-->
        <!--          placeholder="选择上班时间">-->
        <!--        </el-time-select>-->
        <el-select lable="上班时间" v-model="queryParams.dkstartTs" placeholder="请选择">
          <el-option
            v-for="item in this.schedule_groupList"
            :key="item.startTs"
            :label="item.startTs"
            :value="item.startTs">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="下班时间" prop="dkendTs">
        <!--        <el-time-select-->
        <!--          v-model="queryParams.dkendTs"-->
        <!--          :picker-options="{-->
        <!--                start: '08:00',-->
        <!--                step: '00:15',-->
        <!--                end: '24:00'-->
        <!--              }"-->
        <!--          placeholder="选择下班时间">-->
        <!--        </el-time-select>-->
        <el-select lable="下班时间" v-model="queryParams.dkendTs" placeholder="请选择">
          <el-option
            v-for="item in this.schedule_groupList"
            :key="item.endTs"
            :label="item.endTs"
            :value="item.endTs">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="签到情况" prop="isLate">
        <el-select v-model="queryParams.isLate" placeholder="请选择是否迟到" clearable>
          <el-option
            v-for="dict in dict.type.is_late"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="签退情况" prop="leaveEarly">
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
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:clockin:export']"
        >导出</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['system:toClockin:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['system:toClockin:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="18">
        <div style="text-align: center">
          <h3 style="margin-top: 1px">{{userInfo.dept.deptName}}--{{userInfo.nickName}}--打卡任务</h3>
        </div>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="clockinList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="部门" align="center" prop="departmentName" />
      <el-table-column label="员工姓名" align="center" prop="nickName" />
      <!--      <el-table-column label="创建时间" align="center" prop="cts" width="180">-->
      <!--        <template slot-scope="scope">-->
      <!--&lt;!&ndash;          <span>{{ parseTime(scope.row.cts, '{y}-{m}-{d}') }}</span>&ndash;&gt;-->
      <!--          <span>{{scope.row.cts}}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="打卡日期" align="center" prop="day" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.day}}</span>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" prop="dkstartTs" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.dkstartTs}}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" prop="dkendTs" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.dkendTs}}</span>
        </template>
      </el-table-column>
      <el-table-column label="签到情况" align="center" prop="isLate">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.is_late" :value="scope.row.isLate"/>
        </template>
      </el-table-column>
      <el-table-column label="签退情况" align="center" prop="leaveEarly">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.leave_early" :value="scope.row.leaveEarly"/>
        </template>
      </el-table-column>
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template slot-scope="scope">-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-edit"-->
<!--            @click="handleUpdate(scope.row)"-->
<!--            v-hasPermi="['system:clockin:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['system:clockin:remove']"-->
<!--          >删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
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
import {getUser} from '@/api/system/user'
import { listSchedule_group } from '@/api/system/schedule_group'
import { getInfo } from '@/api/login'

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
      // 当前部门的时间组
      queryParamsScheduleGroup: {
        pageNum: 1,
        pageSize: 10,
        gdesc: null,
        depId: null,
        cts: null,
        startTs: null,
        endTs: null
      },
      currentUserId:null,
      // 当前部门排班组数据
      schedule_groupList: [],
      form: {},
      userInfo:{},
      dateRange: [],
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
    this.init();
  },
  methods: {
    /** 查询打卡信息列表 */
    async init(){
      await getInfo().then(resp =>{
        this.currentUserId = resp.user.userId
      })
      getUser(this.currentUserId).then(resp=>{
        this.userInfo = resp.data;
        this.queryParamsScheduleGroup.depId = this.userInfo.dept.deptId
        listSchedule_group(this.queryParamsScheduleGroup).then(response => {
          this.schedule_groupList = response.rows;
          // this.total = response.total;
          this.loading = false;
        });
      })
      this.queryParams.employeesId = this.currentUserId
      this.getList();
    },
    getList() {
      this.loading = true;
      listClockin(this.addDateRange(this.queryParams,this.dateRange)).then(response => {
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
      this.dateRange = [];
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
