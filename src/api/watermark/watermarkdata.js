import request from '@/utils/request'

// 查询水印数据列表
export function listWatermarkdata(query) {
  return request({
    url: '/watermark/watermarkdata/list',
    method: 'get',
    params: query
  })
}

// 查询水印数据详细
export function getWatermarkdata(id) {
  return request({
    url: '/watermark/watermarkdata/' + id,
    method: 'get'
  })
}

// 新增水印数据
export function addWatermarkdata(data) {
  return request({
    url: '/watermark/watermarkdata',
    method: 'post',
    data: data
  })
}

// 修改水印数据
export function updateWatermarkdata(data) {
  return request({
    url: '/watermark/watermarkdata',
    method: 'put',
    data: data
  })
}

// 删除水印数据
export function delWatermarkdata(id) {
  return request({
    url: '/watermark/watermarkdata/' + id,
    method: 'delete'
  })
}
