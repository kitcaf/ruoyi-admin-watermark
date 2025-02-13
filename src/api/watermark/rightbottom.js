import request from '@/utils/request'

// 查询右下角水印列表
export function listRightbottom(query) {
  return request({
    url: '/watermark/rightbottom/list',
    method: 'get',
    params: query
  })
}

// 查询右下角水印详细
export function getRightbottom(rid) {
  return request({
    url: '/watermark/rightbottom/' + rid,
    method: 'get'
  })
}

// 新增右下角水印
export function addRightbottom(data) {
  return request({
    url: '/watermark/rightbottom',
    method: 'post',
    data: data
  })
}

// 修改右下角水印
export function updateRightbottom(data) {
  return request({
    url: '/watermark/rightbottom',
    method: 'put',
    data: data
  })
}

// 删除右下角水印
export function delRightbottom(rid) {
  return request({
    url: '/watermark/rightbottom/' + rid,
    method: 'delete'
  })
}
