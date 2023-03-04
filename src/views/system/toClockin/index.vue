<template>
<div>
  <div style="text-align: center">
    <h2>我的今日打卡任务</h2>
  </div>
  <el-table v-loading="loading" :data="clockinList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" align="center" />
<!--    <el-table-column label="打卡编号" align="center" prop="id" />-->
    <el-table-column label="员工名称" align="center" prop="nickName" />
<!--    <el-table-column label="创建时间" align="center" prop="cts" width="180">-->
<!--      <template slot-scope="scope">-->
<!--        <span>{{scope.row.cts}}</span>-->
<!--      </template>-->
<!--    </el-table-column>-->
    <el-table-column label="打卡日期" align="center" prop="day" width="180">
      <template slot-scope="scope">
        <span>{{scope.row.day}}</span>
      </template>
    </el-table-column>
    <el-table-column label="开始时间" align="center" prop="dkstartTs" width="180">
      <template slot-scope="scope">
        <span>{{scope.row.dkstartTs}}</span>
      </template>
    </el-table-column>
    <el-table-column label="结束时间" align="center" prop="dkendTs" width="180">
      <template slot-scope="scope">
        <span>{{scope.row.dkendTs}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="success"
          icon="el-icon-check"
          :disabled="scope.row.isLate!=0"
          style="width: 20%"
          @click="clockToGo(scope.row)"
          v-hasPermi="['system:clockin:edit']"
        >签到</el-button>
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-s-promotion"
          @click="clockToLeave(scope.row)"
          style="width: 20%"
          v-hasPermi="['system:clockin:remove']"
        >签退</el-button>
      </template>
    </el-table-column>
  </el-table>

</div>
</template>

<script>
import { getInfo } from '@/api/login'
import { listClockin, updateClockin } from '@/api/system/clockin'
export default {
  name: 'index',
  data(){
    return{
      currentUserId:null,
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
      clockinList: [],
      loading: true,
    }
  },
  created(){
    this.init()
  },
  methods:{
    /** 准备页面信息 */
    async init(){
      await getInfo().then(resp =>{
        this.currentUserId = resp.user.userId
      })
      //获取今天是哪一天
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth()+1 //得到月份
      var day = now.getDate(); //得到天
      var thisTime = year+'-'+month+'-'+day
      console.log(thisTime)
      this.queryParams.day = thisTime;
      this.queryParams.employeesId = this.currentUserId;
      this.queryParams.leaveEarly = 0
      this.getList();
      console.log(this.clockinList)
      this.loading = false
    },
    /** 查询打卡信息列表 */
    getList() {
      this.loading = true;
      listClockin(this.queryParams).then(response => {
        this.clockinList = response.rows;
      });
    },

    /** 签到点击事件 */
    clockToGo(row){
      var date = new Date();
      var hour = date.getHours(); // 时
      var minutes = date.getMinutes()<10? '0'+date.getMinutes() : date.getMinutes(); // 分
      var thisTime = hour+''+minutes;
      console.log(thisTime)
      var startTime = row.dkstartTs;
      var endTime = row.dkendTs;
      var startH = startTime.split(":").slice(0,1)
      var startM = startTime.split(":").slice(1)
      var endH = endTime.split(":").slice(0,1)
      var endM = endTime.split(":").slice(1)
      //转成字符串
      startH = startH+'';
      startTime = startTime+''
      startM = startM+''
      endH = endH+'';
      endTime = endTime+'';
      endM = endM+'';
      //将打卡开始时间换算成数字
      if (startH>10){
        startTime = startH+startM
      }else {
        startH =startH.replace(/\b(0+)/gi,"")
        startTime = startH+startM
      }
      //将打卡结束时间换算成数字
      if (endH>10){
        endTime = endH+endM
      }else {
        endH =endH.replace(/\b(0+)/gi,"")
        endTime = endH+endM
      }
      const form = {
        id: row.id,
        isLate: null,
      }
      console.log("form")
      console.log(form)
      //1.太早，不能打卡,早于开始时间5min以上
      if (parseInt(startTime)>(parseInt(thisTime)+5)){
        this.$alert('请在排班时间开始前5分钟后再打卡！', '打卡失败--时间未到', {
          confirmButtonText: '确定',
        });
      }
      //2.准时打卡
      if(parseInt(startTime)<(parseInt(thisTime)+5)){
        form.isLate = 2;
        updateClockin(form).then(response => {
          this.open = false;
        });
        this.$alert('打卡成功！请加油', '打卡成功!', {
          confirmButtonText: '确定',
        });
      }
      //3.迟到
      if (parseInt(startTime)<parseInt(thisTime)&&parseInt(thisTime)<parseInt(endTime)){
        form.isLate = 1
        updateClockin(form).then(response => {
          this.open = false;
        });
        this.$alert('打卡成功！您已迟到！', '打卡成功--迟到', {
          confirmButtonText: '确定',
          callback: action => {
            this.init();
          }
        });
      }
      //4.缺勤
      if (parseInt(thisTime)>parseInt(endTime)){
        form.isLate = 3
        updateClockin(form).then(response => {
          this.open = false;
        });
        this.$alert('已超过最晚打卡时间，您已缺勤', '打卡失败', {
          confirmButtonText: '确定',
          callback: action => {
            this.init();
          }
        });
      }
    },

    /** 签退*/
    clockToLeave(row){
      console.log("签退的")
      console.log(row)
      var date = new Date();
      var hour = date.getHours(); // 时
      var minutes = date.getMinutes()<10? '0'+date.getMinutes() : date.getMinutes(); // 分
      var thisTime = hour+''+minutes;
      console.log(thisTime)
      var endTime = row.dkendTs;
      var endH = endTime.split(":").slice(0,1)
      var endM = endTime.split(":").slice(1)
      endH = endH+'';
      endTime = endTime+'';
      endM = endM+'';
      //将打卡结束时间换算成数字
      if (endH>10){
        endTime = endH+endM
      }else {
        endH =endH.replace(/\b(0+)/gi,"")
        endTime = endH+endM
      }
      const form = {
        id: row.id,
        leaveEarly: null,
      }
      if (row.isLate!=0){
        //1.早退
        if((parseInt(thisTime)+5)<parseInt(endTime)&&(row.isLate!=3)){
          form.leaveEarly = 1
          updateClockin(form).then(response => {
            this.open = false;
          });
          this.$alert('请至少在排班时间结束前5分钟后签退', '签退成功--早退', {
            confirmButtonText: '确定',
            callback: action => {
              this.init();
            }
          });
        }
        //2.签退成功
        if(parseInt(thisTime)>=parseInt(endTime)&&(row.isLate!=3)){
          form.leaveEarly = 2
          updateClockin(form).then(response => {
            this.open = false;
          });
          this.$alert('签退成功！辛苦了！', '签退成功', {
            confirmButtonText: '确定',
            callback: action => {
              this.init();
            }
          });
        }
        //3.缺勤
        if(parseInt(thisTime)>=parseInt(endTime)&&(row.isLate==3)){
          form.leaveEarly = 3
          updateClockin(form).then(response => {
            this.open = false;
          });
          this.$alert('签退成功！但您未在时间范围内签到，计为缺勤', '签退成功--缺勤', {
            confirmButtonText: '确定',
            callback: action => {
              this.init();
            }
          });
        }
      }else {
        this.$alert('请先签到!', '签退失败', {
          confirmButtonText: '确定',
        });
      }


    },

    /** 多选框选中数据*/
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

  }
}
</script>

<style scoped>

</style>
