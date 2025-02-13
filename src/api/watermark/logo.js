import request from '@/utils/request'

// 查询品牌logo列表
export function listLogo(query) {
  return request({
    url: "/watermark/brand/logo/list",
    method: "get",
    params: query,
  })
}

// 查询品牌logo详细
export function getLogo(id) {
  return request({
    url: '/watermark/brand/logo/' + id,
    method: 'get'
  })
}

// 新增品牌logo
export function addLogo(data) {
  return request({
    url: '/watermark/brand/logo',
    method: 'post',
    data: data
  })
}

// 修改品牌logo
export function updateLogo(data) {
  return request({
    url: '/watermark/brand/logo',
    method: 'put',
    data: data
  })
}

// 删除品牌logo
export function delLogo(id) {
  return request({
    url: '/watermark/brand/logo/' + id,
    method: 'delete'
  })
}
