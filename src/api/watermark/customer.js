import request from '@/utils/request'

// 查询品牌Logo列表
export function listBrandLogo(query) {
  return request({
    url: "/app/admin/brandLogo/list",
    method: "get",
    params: query,
  })
}

// 查询品牌Logo详细
export function getBrandLogo(id) {
  return request({
    url: "/app/admin/brandLogo/" + id,
    method: "get",
  });
}

// 新增品牌Logo
export function addBrandLogo(data) {
  return request({
    url: "/app/admin/brandLogo",
    method: "post",
    data: data,
  });
}

// 修改品牌Logo
export function updateBrandLogo(data) {
  return request({
    url: "/app/admin/brandLogo",
    method: "put",
    data: data,
  })
}

// 删除品牌Logo
export function delBrandLogo(id) {
  return request({
    url: "/app/admin/brandLogo/" + id,
    method: "delete",
  });
}

// 修改品牌Logo状态
export function changeBrandLogoStatus(data) {
  return request({
    url: "/app/admin/brandLogo/changeStatus",
    method: "put",
    data: data
  })
}

