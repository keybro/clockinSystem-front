import request from '@/utils/request'

// 查询排班安排列表
export function listManager(query) {
  return request({
    url: '/system/manager/list',
    method: 'get',
    params: query
  })
}

// 查询排班安排详细
export function getManager(id) {
  return request({
    url: '/system/manager/' + id,
    method: 'get'
  })
}

// 新增排班安排
export function addManager(data) {
  return request({
    url: '/system/manager',
    method: 'post',
    data: data
  })
}

// 修改排班安排
export function updateManager(data) {
  return request({
    url: '/system/manager',
    method: 'put',
    data: data
  })
}

// 删除排班安排
export function delManager(id) {
  return request({
    url: '/system/manager/' + id,
    method: 'delete'
  })
}
