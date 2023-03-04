import request from '@/utils/request'

// 查询排班安排列表
export function listSchedule_manage(query) {
  return request({
    url: '/system/schedule_manage/list',
    method: 'get',
    params: query
  })
}

// 查询排班安排详细
export function getSchedule_manage(id) {
  return request({
    url: '/system/schedule_manage/' + id,
    method: 'get'
  })
}

// 新增排班安排
export function addSchedule_manage(data) {
  return request({
    url: '/system/schedule_manage',
    method: 'post',
    data: data
  })
}

// 修改排班安排
export function updateSchedule_manage(data) {
  return request({
    url: '/system/schedule_manage',
    method: 'put',
    data: data
  })
}

// 删除排班安排
export function delSchedule_manage(id) {
  return request({
    url: '/system/schedule_manage/' + id,
    method: 'delete'
  })
}
