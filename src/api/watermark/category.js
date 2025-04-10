import request from '@/utils/request'

// 查询水印分类列表
export function listCategory(query) {
  return request({
    url: '/app/admin/category/list',
    method: 'get',
    params: query
  })
}

// 查询水印分类详细
export function getCategory(id) {
  return request({
    url: '/app/admin/category/' + id,
    method: 'get'
  })
}

// 新增水印分类
export function addCategory(data) {
  return request({
    url: '/app/admin/category',
    method: 'post',
    data: data
  })
}

// 修改水印分类
export function updateCategory(data) {
  return request({
    url: '/app/admin/category',
    method: 'put',
    data: data
  })
}

// 删除水印分类
export function delCategory(id) {
  return request({
    url: '/app/admin/category/' + id,
    method: 'delete'
  })
}
