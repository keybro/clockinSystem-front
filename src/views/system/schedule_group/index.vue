<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
    </el-form>

    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark" style="text-align: center">
          <h3 style="margin-top: 0px">{{deptList[0].deptName}}部门--排班组</h3>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:schedule_group:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          style="margin-right: 55vw"
          v-hasPermi="['system:schedule_group:export']"
        >导出</el-button>
        <el-button
          type="primary"
          icon="el-icon-date"
          size="small "
          @click="onKeyToSchedule"
        >一键排班</el-button>
        <el-button
          type="primary"
          icon="el-icon-date"
          size="small "
          @click="specialModify"
        >特殊修改</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="schedule_groupList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="班组编号" align="center" prop="id" />-->
      <el-table-column label="班组名称" align="center" prop="gdesc" />
      <el-table-column label="所属部门" align="center" prop="depName" />
<!--      <el-table-column label="创建时间" align="center" prop="cts" width="180">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ parseTime(scope.row.cts, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="开始时间" align="center" prop="startTs" width="180">
        <template slot-scope="scope">
<!--          <span>{{ parseTime(scope.row.startTs, '{h}-{i}-{m}') }}</span>-->
          <span>{{scope.row.startTs}}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTs" width="180">
        <template slot-scope="scope">
<!--          <span>{{ parseTime(scope.row.endTs, '{h}:{i}:{s}') }}</span>-->
          <span>{{scope.row.endTs}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="editMember(scope.row)"
          >编辑人员</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:schedule_group:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:schedule_group:remove']"
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

    <!-- 添加或修改排班组对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班组名称" prop="gdesc">
          <el-input v-model="form.gdesc" placeholder="请输入班组名称"/>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTs">
          <el-time-select
            v-model="form.startTs"
            :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '18:30'
            }"
            placeholder="选择开始时间">
          </el-time-select>
        </el-form-item>



        <el-form-item label="结束时间" prop="endTs">
          <el-time-select
            v-model="form.endTs"
            :picker-options="{
              start: '08:00',
              step: '00:15',
              end: '24:00'
            }"
            placeholder="选择开始时间">
          </el-time-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加人员对话框-->
    <el-dialog :title="title" :visible.sync="memberOpen" width="500px" append-to-body>
      <div>
        <el-checkbox-group v-model="userGroupList">
<!--          <el-checkbox label=""></el-checkbox>-->
<!--          <el-checkbox label="复选框 B"></el-checkbox>-->
<!--          <el-checkbox label="复选框 C"></el-checkbox>-->
<!--          <el-checkbox label="复选框D"></el-checkbox>-->
<!--          <el-checkbox label="复选框E"></el-checkbox>-->
          <el-checkbox v-for="(item,index) in userList" :key="index" :label="item.userId" >{{item.nickName}}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="makeSureMember">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 一键生成对话框-->
    <el-dialog :title="title" :visible.sync="paibanOpen" width="500px" append-to-body>
      <div style="text-align: center">
        排班月份:
        <el-date-picker
          v-model="month"
          format="yyyy-M"
          value-format="yyyy-M"
          type="month"
          @change = "changeMonth($event)"
          placeholder="选择月">
        </el-date-picker>
        <p v-if="this.no == false" style="font-weight: bold;color: red">本月已批量排班,若需批量修改，请点击"特殊修改"按钮</p>
      </div>
      <div style="text-align: center;margin-top: 20px">
        排班规则:
        <el-select v-model="choseFun" placeholder="请选择">
          <el-option
            v-for="item in choseOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="openFullScreen" :disabled="this.ifCanSchedule == false">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSchedule_group, getSchedule_group, delSchedule_group, addSchedule_group, updateSchedule_group } from "@/api/system/schedule_group";
import {listUser} from '@/api/system/user'
import { addGroup_emp, delGroup_emp, listGroup_emp } from '@/api/system/group_emp'
import { addSchedule_manage, listSchedule_manage } from '@/api/system/schedule_manage'
import async from 'async'
import { addClockin } from '@/api/system/clockin'
import { listDept } from '@/api/system/dept'

export default {
  name: "Schedule_group",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      ifCanSchedule:true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 排班组表格数据
      schedule_groupList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      memberOpen:false,
      paibanOpen:false,
      //全屏等待创建
      fullscreenLoading: false,
      //要排班的月份
      month:'',
      //人员复选框
      checkList: ['复选框 A'],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gdesc: null,
        depId: null,
        cts: null,
        startTs: null,
        endTs: null
      },
      //查询排班组参数
      queryUserParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      },
      //用于判断当月是否已经被排班
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
      schedule_manageList: [],
      dateRange: [],
      no:true,
      choseFun:"1",
      choseOptions:[{
        value: '1',
        label: '周六、周日双休'
      }, {
        value: '2',
        label: '周日单休'
      }, {
        value: '3',
        label: '暂不安排休息'
      }],
      //部门所有用户列表
      userList:null,
      //复选框选择值
      userGroupList:[],
      //排班组成员条件参数
      queryGroupUserParams: {
        pageNum: 1,
        pageSize: 10,
        gid: null,
        eid: null,
        cts: null
      },
      group_empList: null,
      makeGroupUser_List:null,
      //编辑组内成员row的groupId
      groupId:null,
      // 表单参数
      form: {},
      //打卡表
      form2: {
        startTs: '',
        endTs: '',
        cts: '',
        depId: '',
        employeesId: '',
        day: ''
      },
      //为排班组添加成员的form
      formAddUser: {},
      formAddGroupSchedulez: {},
      formAddGroupSchedulew: {},
      formAddGroupScheduley: {},
      deptqueryParams:{
        deptId:null,
        deptName: undefined,
        status: undefined
      },
      deptList:[],
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    const deptId = this.$route.params.depId
    this.queryParams.depId = deptId
    // console.log(deptId)
    this.getList();
    this.queryUserParams.deptId = deptId
    this.deptqueryParams.deptId = deptId;
    listDept(this.deptqueryParams).then(response => {
      this.deptList = this.handleTree(response.data, "deptId");
      console.log(this.deptList)
    });
    listUser(this.addDateRange(this.queryUserParams, this.dateRange)).then(response => {
        this.userList = response.rows;
        this.loading = false;
      }
    );
  },
  methods: {
    /** 查询排班组列表 */
    getList() {
      this.loading = true;
      listSchedule_group(this.queryParams).then(response => {
        this.schedule_groupList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    //特殊排班按钮
    specialModify(){
      const data = this.$route.params.depId
      this.$router.push('/schedule/specialSchedule/'+data)
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.memberOpen = false
      this.paibanOpen = false
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        gdesc: null,
        depId: null,
        cts: null,
        startTs: null,
        endTs: null
      };
      this.resetForm("form");
    },

    /** 确定一键排班 */
    async openFullScreen() {
      const data = this.$route.params.depId
      this.paibanOpen = false
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
      var TimeYear = this.month.split('-').slice(0,1);
      const TimeMonth = this.month.split('-').slice(1);
      let countDays = 0;
      if (TimeMonth=='2'){
        //是闰年
        if (TimeYear%4==0&&TimeYear%100!=0){
          countDays = 29;
        }else {
          countDays = 28;
        }
      }else if (TimeMonth=='1'||TimeMonth=='3'||TimeMonth=='5'||TimeMonth=='7'||TimeMonth=='8'||TimeMonth=='10'||TimeMonth=='12'){
        countDays = 31;
      }else {
        countDays = 30
      }
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
        console.log("创建时间"+createTime)
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
          for (let k = 1; k <= countDays; k++){
            form.day = TimeYear+'-'+TimeMonth+'-'+k
            clockinForm.day = TimeYear+'-'+TimeMonth+'-'+k
            form.employeesId = makeGroupUser_List_up[j].eid;
            clockinForm.employeesId = makeGroupUser_List_up[j].eid;
            console.log("这一轮的form")
            console.log(form.day)
            console.log(form)
            console.log("完了")
            await console.log("创建排班表")
            var dt = new Date(form.day);
            var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var week = dt.getDay();
            console.log("打印数值---",dt.getDay());
            console.log("所传日期是星期",weekDay[dt.getDay()]);
            //1.如果选择的规则是双休
            if(this.choseFun == 1){
              if (week!=0 &&week!=6){
                //批量添加数据进入schedule表
                await addSchedule_manage(form).then(response => {
                  this.open = false;
                });
                //批量添加数据到clockin表
                // await console.log("创建打卡表")
                await addClockin(clockinForm).then(response => {
                  this.open = false;
                });
              }
            }
            //2.如果选择的规则是单休
            if (this.choseFun == 2){
              if (week!=0){
                //批量添加数据进入schedule表
                await addSchedule_manage(form).then(response => {
                  this.open = false;
                });
                //批量添加数据到clockin表
                // await console.log("创建打卡表")
                await addClockin(clockinForm).then(response => {
                  this.open = false;
                });
              }
            }
            //3.如果选择的规则是不休息
            if (this.choseFun == 3){
              //批量添加数据进入schedule表
              await addSchedule_manage(form).then(response => {
                this.open = false;
              });
              //批量添加数据到clockin表
              // await console.log("创建打卡表")
              await addClockin(clockinForm).then(response => {
                this.open = false;
              });
            }
            //批量添加数据进入schedule表
            // await addSchedule_manage(form).then(response => {
            //   this.open = false;
            // });
            //批量添加数据到clockin表
            // await console.log("创建打卡表")
            // await addClockin(clockinForm).then(response => {
            //   this.open = false;
            // });
          }
        }
      }
      loading.close()
      this.$modal.msgSuccess("排班成功！");
      this.$router.push('/schedule/department_schedule_manage/'+data)

    },

    //监听日期改变，如果这个月已经排过了就不让排
    async changeMonth(val){
      console.log(val)
      var startTime = val+'-1'
      var endTime = val+'-28'
      console.log(startTime)
      console.log(endTime)
      this.dateRange[0] = startTime;
      this.dateRange[1] = endTime;
      console.log(this.dateRange)
      this.queryParamsScheduleList.depId = this.$route.params.depId;
      await listSchedule_manage(this.addDateRange(this.queryParamsScheduleList,this.dateRange)).then(response =>{
          this.schedule_manageList = response.rows;
          console.log(response.rows)
      })
      //如果本月有数据，显示不让排班
      if (this.schedule_manageList.length>=2){
        this.no = false
        this.ifCanSchedule = false

      }else {
        this.no = true;
        this.ifCanSchedule = true

      }
      // listSchedule_manage(this.queryParamsScheduleList).then(response => {
      //   this.schedule_manageList = response.rows;
      //   console.log(response.rows)
      // });

    },


    onKeyToSchedule(){
      this.paibanOpen = true;
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
      this.title = "添加排班组";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSchedule_group(id).then(response => {
        this.form = response.data;
        this.open = true;
      });
    },
    /** 编辑排班组成员*/
    editMember(row){
      this.memberOpen = true
      this.groupId = row.id;
      this.queryGroupUserParams.gid = this.groupId
      listGroup_emp(this.queryGroupUserParams).then(response => {
        this.group_empList = response.rows;
        // this.userGroupList =
        // this.total = response.total;
        this.loading = false;
        this.userGroupList = [];
        for (let i = 0; i < response.rows.length; i++) {
          this.userGroupList[i] = response.rows[i].eid;
        }
      });
    },

    /** 生成某个班组id下的用户列表*/
    // makeGroupUserList(id){
    //   console.log("传进组id"+ id);
    //   this.makeGroupUser_List=null;
    //   this.queryGroupUserParams.gid = id;
    //   listGroup_emp(this.queryGroupUserParams).then(response => {
    //     this.makeGroupUser_List = response.rows;
    //     console.log("接口参数")
    //     console.log(this.makeGroupUser_List)
    //     this.total = response.total;
    //     this.loading = false;
    //     return this.makeGroupUser_List;
    //   });
    // },

    /** 确定人员 */
    makeSureMember(){
      console.log("进来了")
      this.memberOpen = false
      const groupId = this.groupId
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth()<10 ? '0'+now.getMonth():now.getMonth(); //得到月份
      var day = now.getDate()<10 ? '0'+now.getDate():now.getDate(); //得到天
      var createTime = year+'-'+month+'-'+day
      console.log(this.group_empList)
      for (let i = 0; i < this.group_empList.length; i++) {
        delGroup_emp(this.group_empList[i].id)
      }
      for (let i = 0; i < this.userGroupList.length; i++) {
        const eid = this.userGroupList[i];
        this.formAddUser.eid = eid;
        this.formAddUser.gid = groupId;
        this.formAddUser.cts = createTime;
        addGroup_emp(this.formAddUser).then(response => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
        });
      }

    },
    /** 提交按钮 */
    submitForm() {
      //计算创建时间
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth()<10 ? '0'+(now.getMonth()+1):(now.getMonth()+1); //得到月份
      var day = now.getDate()<10 ? '0'+now.getDate():now.getDate(); //得到天
      var createTime = year+'-'+month+'-'+day
      this.form.cts = createTime
      //获取当前页面部门
      const depId = this.$route.params.depId
      this.form.depId = depId

      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSchedule_group(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSchedule_group(this.formAddUser).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              // this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除排班组编号为"' + ids + '"的数据项？').then(function() {
        return delSchedule_group(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/schedule_group/export', {
        ...this.queryParams
      }, `schedule_group_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
