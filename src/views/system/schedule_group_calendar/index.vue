<template>
  <div>
    <el-calendar class="test">
      <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
      <template
        slot="dateCell"
        slot-scope="{date, data}">
        <p>
          {{ data.day.split('-').slice(1).join('-') }}
          <span v-if="data.day.split('-').slice(2)=='15'">已排班已排班</span>
        </p>

      </template>
    </el-calendar>
  </div>
</template>

<script>
import {
  addSchedule_manage, delSchedule_manage,
  getSchedule_manage,
  listSchedule_manage,
  updateSchedule_manage
} from '@/api/system/schedule_manage'

export default {
  name: 'index',
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
      // 排班安排表格数据
      schedule_manageList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startTs: null,
        endTs: null,
        employeesId: null,
        cts: null,
        day: null,
        depId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    const deptId = this.$route.params.depId;
    this.queryParams.depId = deptId
    console.log(deptId)
    this.getList();
  },
  methods: {
    /** 查询排班安排列表 */
    getList() {
      this.loading = true;
      listSchedule_manage(this.queryParams).then(response => {
        this.schedule_manageList = response.rows;
        console.log(response.rows)
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
        startTs: null,
        endTs: null,
        employeesId: null,
        cts: null,
        day: null,
        depId: null
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
      this.title = "添加排班安排";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSchedule_manage(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改排班安排";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSchedule_manage(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSchedule_manage(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除排班安排编号为"' + ids + '"的数据项？').then(function() {
        return delSchedule_manage(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/schedule_manage/export', {
        ...this.queryParams
      }, `schedule_manage_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.is-selected {
  color: #1989FA;
}
.test /deep/  .el-calendar-table .el-calendar-day{
  width: 100%;
  height: 150px;
}

</style>
