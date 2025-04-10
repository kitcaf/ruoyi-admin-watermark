import request from '@/utils/request'

// 查询右下角水印列表
export function listRightbottom(query) {
  return request({
    url: '/app/admin/rightbottom/list',
    method: 'get',
    params: query
  })
}

// 查询右下角水印详细
export function getRightbottom(rid) {
  return request({
    url: '/app/admin/rightbottom/' + rid,
    method: 'get'
  })
}

// 新增右下角水印
export function addRightbottom(data) {
  return request({
    url: '/app/admin/rightbottom',
    method: 'post',
    data: data
  })
}

// 修改右下角水印
export function updateRightbottom(data) {
  return request({
    url: '/app/admin/rightbottom',
    method: 'put',
    data: data
  })
}

// 删除右下角水印
export function delRightbottom(rids) {
  return request({
    url: '/app/admin/rightbottom/' + rids,
    method: 'delete'
  })
}

// 导出右下角水印
export function exportRightbottom(query) {
  return request({
    url: '/app/admin/rightbottom/export',
    method: 'post',
    params: query
  })
}
