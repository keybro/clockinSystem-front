import request from '@/utils/request'

// 查询班组人员列表
export function listGroup_emp(query) {
  return request({
    url: '/system/group_emp/list',
    method: 'get',
    params: query
  })
}

// 查询班组人员详细
export function getGroup_emp(id) {
  return request({
    url: '/system/group_emp/' + id,
    method: 'get'
  })
}

// 新增班组人员
export function addGroup_emp(data) {
  return request({
    url: '/system/group_emp',
    method: 'post',
    data: data
  })
}

// 修改班组人员
export function updateGroup_emp(data) {
  return request({
    url: '/system/group_emp',
    method: 'put',
    data: data
  })
}

// 删除班组人员
export function delGroup_emp(id) {
  return request({
    url: '/system/group_emp/' + id,
    method: 'delete'
  })
}
