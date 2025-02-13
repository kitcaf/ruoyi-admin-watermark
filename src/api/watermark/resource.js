import request from '@/utils/request'

// 查询资源管理列表
export function listResource(query) {
  return request({
    url: '/watermark/resource/list',
    method: 'get',
    params: query
  })
}

// 查询资源管理详细
export function getResource(rid) {
  return request({
    url: '/watermark/resource/' + rid,
    method: 'get'
  })
}

// 新增资源管理
export function addResource(data) {
  return request({
    url: '/watermark/resource',
    method: 'post',
    data: data
  })
}

// 修改资源管理
export function updateResource(data) {
  return request({
    url: '/watermark/resource',
    method: 'put',
    data: data
  })
}

// 删除资源管理
export function delResource(rid) {
  return request({
    url: '/watermark/resource/' + rid,
    method: 'delete'
  })
}
