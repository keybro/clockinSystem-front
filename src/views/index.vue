<template>
<div style="text-align: center">
  <h1 style="margin-top: 35vh">欢迎你!--{{this.deptName}}的{{this.userName}}</h1>

</div>
</template>

<script>

import { getInfo } from '@/api/login'

export default {
  data() {
    return {
      userName:"",
      deptName:""
    }
  },
  created() {
    this.init()
  },
  methods: {
    init(){
      getInfo().then(resp =>{
        console.log(resp)
        // this.currentUserId = resp.user.userId
        this.userName = resp.user.nickName
        this.deptName = resp.user.dept.deptName
      })
    },


  }
}
</script>

<style scoped lang="scss">


</style>

