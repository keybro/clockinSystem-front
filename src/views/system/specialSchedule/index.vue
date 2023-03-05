<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日期范围">
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

      <el-form-item label="员工姓名" prop="nickName">
        <el-select v-model="queryParams.nickName" placeholder="请选择员工" clearable>
          <el-option
            v-for="item in this.userList"
            :key="item.nickName"
            :label="item.nickName"
            :value="item.nickName"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="上班时间" prop="startTs">
        <!--        <el-date-picker clearable-->
        <!--          v-model="queryParams.startTs"-->
        <!--          type="date"-->
        <!--          value-format="yyyy-MM-dd"-->
        <!--          placeholder="请选择开始时间">-->
        <!--        </el-date-picker>-->
        <!--        <el-time-select-->
        <!--          v-model="queryParams.startTs"-->
        <!--            :picker-options="{-->
        <!--                start: '08:00',-->
        <!--                step: '00:15',-->
        <!--                end: '18:30'-->
        <!--              }"-->
        <!--          placeholder="选择上班时间">-->
        <!--        </el-time-select>-->
        <el-select lable="上班时间" v-model="queryParams.startTs" placeholder="请选择">
          <el-option
            v-for="item in this.schedule_groupList"
            :key="item.startTs"
            :label="item.startTs"
            :value="item.startTs">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="下班时间" prop="endTs">
        <!--        <el-date-picker clearable-->
        <!--          v-model="queryParams.endTs"-->
        <!--          type="date"-->
        <!--          value-format="yyyy-MM-dd"-->
        <!--          placeholder="请选择结束时间">-->
        <!--        </el-date-picker>-->
        <el-select lable="下班时间" v-model="queryParams.endTs" placeholder="请选择">
          <el-option
            v-for="item in this.schedule_groupList"
            :key="item.endTs"
            :label="item.endTs"
            :value="item.endTs">
          </el-option>
        </el-select>
      </el-form-item>


      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:toClockin:add']"
        >新增</el-button>
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:schedule_manage:export']"
        >导出</el-button>
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:schedule_manage:remove']"
        >删除/放假</el-button>
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:schedule_manage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="15" style="text-align: center">
        <h3 style="margin-top: 4px">{{deptList[0].deptName}}--排班特殊修改</h3>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="schedule_manageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!--      <el-table-column label="排班编号" align="center" prop="id" />-->
      <el-table-column label="部门" align="center" prop="departmentName" />
      <el-table-column label="员工" align="center" prop="employerName" />
      <el-table-column label="排班日期" align="center" prop="day" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.day, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" prop="startTs" width="180">
        <template slot-scope="scope">
          <!--          <span>{{ parseTime(scope.row.startTs, '{y}-{m}-{d}') }}</span>-->
          <span>{{ scope.row.startTs}}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" prop="endTs" width="180">
        <template slot-scope="scope">
          <!--          <span>{{ parseTime(scope.row.endTs, '{y}-{m}-{d}') }}</span>-->
          <span>{{scope.row.endTs}}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" align="center" prop="cts" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.cts, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>


      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:schedule_manage:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:schedule_manage:remove']"
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

    <!-- 添加或修改排班安排对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上班时间" prop="startTs">

          <el-time-select
            v-model="form.startTs"
            :picker-options="{
                start: '08:00',
                step: '00:15',
                end: '19:00'
              }"
            placeholder="选择上班时间">
          </el-time-select>
        </el-form-item>
        <el-form-item label="下班时间" prop="endTs">

          <el-time-select
            v-model="form.endTs"
            :picker-options="{
                start: '08:00',
                step: '00:15',
                end: '24:00'
              }"
            placeholder="选择上班时间">
          </el-time-select>
        </el-form-item>

        <el-form-item label="排班日期" prop="day">
          <el-date-picker clearable
                          v-model="form.day"
                          type="date"
                          value-format="yyyy-M-d"
                          placeholder="请选择排班日期">
          </el-date-picker>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--    添加对话框-->
    <el-dialog :title="title" :visible.sync="addOpen" width="500px" append-to-body>
      <el-form ref="form" :model="addForm" :rules="rules" label-width="80px">


        <el-date-picker
          v-model="addDaterange"
          type="daterange"
          value-format="yyyy-M-d"
          range-separator="至"
          @change="selectTime($event)"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <p v-if="this.ifCanAdd == false" style="font-weight: bold;color: red">所选日期区间部门已有排班,请重新选择日期区间</p>
        <p v-if="this.kuayue == true" style="font-weight: bold;color: red">该添加功能暂不支持跨月排班，请重新选择</p>
        <p v-if="this.ifqiangpao == true" style="font-weight: bold;color: red">所选日期有尚未批量按月批量排班的月份,请先批量排班该月</p>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addNewSchedule" :disabled="ifCanAdd == false || kuayue == true || ifqiangpao == true">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSchedule_manage, getSchedule_manage, delSchedule_manage, addSchedule_manage, updateSchedule_manage } from "@/api/system/schedule_manage";
import { listSchedule_group } from '@/api/system/schedule_group'
import { listUser } from '@/api/system/user'
import { listDept } from '@/api/system/dept'
import { listGroup_emp } from '@/api/system/group_emp'
import { addClockin } from '@/api/system/clockin'

export default {
  name: "Schedule_manage",
  data() {
    return {
      value:'',
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
      ifCanAdd:true,
      // 弹出层标题
      title: "",
      addForm:{},
      addOpen:false,
      // 是否显示弹出层
      open: false,
      schedule_groupList: [],
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
      deptqueryParams:{
        deptId:null,
        deptName: undefined,
        status: undefined
      },
      deptList:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startTs: null,
        endTs: null,
        employeesId: null,
        cts: null,
        day: null,
        depId: null,
        nickName:null
      },
      userList:[],
      queryParamsUserNameList:{
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
        postName:undefined
      },
      queryParamsScheduleList: {
        pageNum: 1,
        pageSize: 10,
        startTs: null,
        endTs: null,
        employeesId: null,
        cts: null,
        day: null,
        depId: null,
        nickName:null
      },
      tiaozhuanDepId:null,
      // 表单参数
      form: {},
      dateRange: [],
      //排班组成员条件参数
      queryGroupUserParams: {
        pageNum: 1,
        pageSize: 10,
        gid: null,
        eid: null,
        cts: null
      },
      // 表单校验
      rules: {
      },
      qiangpao_schedule_manageList:[],
      kuayue:false,
      qiangpaoDateRange:[],
      ifqiangpao:false,
      addDaterange:[],
    };
  },
  created() {
    const dept_id = this.$route.params.depId;
    this.tiaozhuanDepId = dept_id;
    this.queryParams.depId = dept_id;
    this.queryParamsScheduleGroup.depId = dept_id;
    this.queryParamsUserNameList.deptId = dept_id
    this.deptqueryParams.deptId = dept_id;
    listDept(this.deptqueryParams).then(response => {
      this.deptList = this.handleTree(response.data, "deptId");
      console.log(this.deptList)
    });
    listSchedule_group(this.queryParamsScheduleGroup).then(response => {
      this.schedule_groupList = response.rows;
      // this.total = response.total;
      this.loading = false;
    });
    listUser(this.queryParamsUserNameList).then(response => {
      this.userList = response.rows;
      console.log(this.userList)
    });
    this.getList();
  },
  methods: {
    /** 查询排班安排列表 */
    getList() {
      this.loading = true;
      listSchedule_manage(this.addDateRange(this.queryParams,this.dateRange)).then(response => {
        this.schedule_manageList = response.rows;
        console.log(response.rows)
        this.total = response.total;
        this.loading = false;
      });
    },

    async selectTime(val){
      console.log("执行了")
      console.log(this.addDaterange)
      await listSchedule_manage(this.addDateRange(this.queryParams,this.addDaterange)).then(response => {
        this.add_schedule_manageList = response.rows;
        this.loading = false;
        if (this.add_schedule_manageList.length>=1){
          this.ifCanAdd = false;
        }else {
          this.ifCanAdd = true;
        }
        //不允许跨月
        var startMonth = this.addDaterange[0].split('-').slice(1,2)[0]
        var endMonth = this.addDaterange[1].split('-').slice(1,2)[0]
        if (startMonth != endMonth){
          this.kuayue = true;
        }else {
          this.kuayue = false;
        }
      });
      //不允许没有先按月份排班就直接自定义天数
      var goYear = val[0].split('-').slice(0,1)[0]
      var goMonth = val[0].split('-').slice(1,2)[0]
      var startTime = goYear+'-'+goMonth+'-1'
      var endTime = goYear+'-'+goMonth+'-28'
      console.log(startTime)
      console.log(endTime)
      this.qiangpaoDateRange[0] = startTime;
      this.qiangpaoDateRange[1] = endTime;
      this.queryParamsScheduleList.depId = this.$route.params.depId;
      await listSchedule_manage(this.addDateRange(this.queryParamsScheduleList,this.qiangpaoDateRange)).then(response =>{
        this.qiangpao_schedule_manageList = response.rows;
        console.log(response.rows)
      })
      if (this.qiangpao_schedule_manageList.length>=1){
        this.ifqiangpao = false;
      }else {
        this.ifqiangpao = true
      }
    },

    /** 增加新的排班 */
    async addNewSchedule(){
      const data = this.$route.params.depId
      this.addOpen = false
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth()<10 ? '0'+(now.getMonth()+1):(now.getMonth()+1) //得到月份
      var day = now.getDate()<10 ? '0'+now.getDate():now.getDate(); //得到天
      var createTime = year+'-'+month+'-'+day
      // var TimeYear = this.month.split('-').slice(0,1);
      // const TimeMonth = this.month.split('-').slice(1);
      // let countDays = 0;
      var startYear = this.addDaterange[0].split('-').slice(0,1)[0]
      var startMonth = this.addDaterange[0].split('-').slice(1,2)[0]
      var startDay = this.addDaterange[0].split('-').slice(2,3)[0]
      var endYear = this.addDaterange[1].split('-').slice(0,1)[0]
      var endMonth = this.addDaterange[1].split('-').slice(1,2)[0]
      var endDay = this.addDaterange[1].split('-').slice(2,3)[0]

      for (let i = 0; i < this.schedule_groupList.length; i++) {
        console.log("执行")
        const form = {
          startTs:'',
          endTs:'',
          cts:'',
          depId:'',
          employeesId:'',
          day:''
        };
        const clockinForm={
          cts:'',
          depId:'',
          employeesId:'',
          day:'',
          dkstartTs:'',
          dkendTs:"",
          isLate:"0",
          leaveEarly:"0",
        };
        form.startTs = this.schedule_groupList[i].startTs;
        form.endTs = this.schedule_groupList[i].endTs;
        form.cts = createTime;
        clockinForm.dkstartTs = this.schedule_groupList[i].startTs;
        clockinForm.dkendTs = this.schedule_groupList[i].endTs;
        clockinForm.cts = createTime;
        form.depId = this.$route.params.depId;
        this.queryGroupUserParams.gid = this.schedule_groupList[i].id;
        // console.log(form)
        let makeGroupUser_List_up  ={};
        await listGroup_emp(this.queryGroupUserParams).then(response => {
          makeGroupUser_List_up = response.rows;
          console.log("生成用户列表")
          console.log(makeGroupUser_List_up)
        })
        for (let j = 0; j < makeGroupUser_List_up.length; j++){
          for (let k = startDay; k <= endDay; k++){
            form.day = startYear+'-'+startMonth+'-'+k
            clockinForm.day = startYear+'-'+startMonth+'-'+k
            form.employeesId = makeGroupUser_List_up[j].eid;
            clockinForm.employeesId = makeGroupUser_List_up[j].eid;
            console.log("这一轮的form")
            console.log(form.day)
            console.log(form)
            console.log("完了")
            await console.log("创建排班表")

            //批量添加数据进入schedule表
            await addSchedule_manage(form).then(response => {
              this.open = false;
            });
            //批量添加数据到clockin表
            await console.log("创建打卡表")
            await addClockin(clockinForm).then(response => {
              this.open = false;
            });
          }
        }
      }
      loading.close()
      this.$modal.msgSuccess("排班成功！");
      this.getList()
      // this.$router.push('/schedule/department_schedule_manage/'+data)

    },
    // 取消按钮
    cancel() {
      this.addOpen = false
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
      this.addOpen= true;
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
              this.$modal.confirm("请前往部门排班进行同步修改").then(function(){
              }).then(() =>{
                this.tiao()
              })
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
        this.$modal.confirm("请前往部门排班进行同步修改").then(function(){
        }).then(() =>{
          this.tiao()
        })
      }).catch(() => {});
    },
    tiao(){
      this.$router.push("/clockin/clockinDeptTask/"+this.tiaozhuanDepId)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/schedule_manage/export', {
        ...this.queryParams
      }, `schedule_manage_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
