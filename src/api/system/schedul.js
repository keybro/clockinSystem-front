import request from '@/utils/request'

// 查询排班设置列表
export function listSchedul(query) {
  return request({
    url: '/system/schedul/list',
    method: 'get',
    params: query
  })
}

// 查询排班设置详细
export function getSchedul(id) {
  return request({
    url: '/system/schedul/' + id,
    method: 'get'
  })
}

// 新增排班设置
export function addSchedul(data) {
  return request({
    url: '/system/schedul',
    method: 'post',
    data: data
  })
}

// 修改排班设置
export function updateSchedul(data) {
  return request({
    url: '/system/schedul',
    method: 'put',
    data: data
  })
}

// 删除排班设置
export function delSchedul(id) {
  return request({
    url: '/system/schedul/' + id,
    method: 'delete'
  })
}
