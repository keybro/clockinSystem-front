import request from '@/utils/request'

// 查询打卡信息列表
export function listClockin(query) {
  return request({
    url: '/system/clockin/list',
    method: 'get',
    params: query
  })
}

// 查询打卡信息详细
export function getClockin(id) {
  return request({
    url: '/system/clockin/' + id,
    method: 'get'
  })
}

// 新增打卡信息
export function addClockin(data) {
  return request({
    url: '/system/clockin',
    method: 'post',
    data: data
  })
}

// 修改打卡信息
export function updateClockin(data) {
  return request({
    url: '/system/clockin',
    method: 'put',
    data: data
  })
}

// 删除打卡信息
export function delClockin(id) {
  return request({
    url: '/system/clockin/' + id,
    method: 'delete'
  })
}
