import request from '@/utils/request'

// 查询排班组列表
export function listSchedule_group(query) {
  return request({
    url: '/system/schedule_group/list',
    method: 'get',
    params: query
  })
}

// 查询排班组详细
export function getSchedule_group(id) {
  return request({
    url: '/system/schedule_group/' + id,
    method: 'get'
  })
}

// 新增排班组
export function addSchedule_group(data) {
  return request({
    url: '/system/schedule_group',
    method: 'post',
    data: data
  })
}

// 修改排班组
export function updateSchedule_group(data) {
  return request({
    url: '/system/schedule_group',
    method: 'put',
    data: data
  })
}

// 删除排班组
export function delSchedule_group(id) {
  return request({
    url: '/system/schedule_group/' + id,
    method: 'delete'
  })
}
