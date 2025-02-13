import request from '@/utils/request'

// 查询客户品牌logo关联列表
export function listCustomer(query) {
  return request({
    url: "/watermark/brand/customer/list",
    method: "get",
    params: query,
  })
}

// 查询客户品牌logo关联详细
export function getCustomer(id) {
  return request({
    url: "/watermark/brand/customer/" + id,
    method: "get",
  });
}

// 新增客户品牌logo关联
export function addCustomer(data) {
  return request({
    url: "/watermark/brand/customer",
    method: "post",
    data: data,
  });
}

// 修改客户品牌logo关联
export function updateCustomer(data) {
  return request({
    url: "/watermark/brand/customer",
    method: "put",
    data: data,
  })
}

// 删除客户品牌logo关联
export function delCustomer(id) {
  return request({
    url: "/watermark/brand/customer/" + id,
    method: "delete",
  });
}

