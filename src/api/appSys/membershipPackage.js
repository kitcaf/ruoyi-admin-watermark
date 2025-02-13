import request from '@/utils/request'

// 查询会员套餐列表
export function listPackage(query) {
    return request({
        url: '/app/admin/package/list',
        method: 'get',
        params: query
    })
}

// 查询会员套餐详细
export function getPackage(id) {
    return request({
        url: '/app/admin/package/' + id,
        method: 'get'
    })
}

// 新增会员套餐
export function addPackage(data) {
    return request({
        url: '/app/admin/package',
        method: 'post',
        data: data
    })
}

// 修改会员套餐
export function updatePackage(data) {
    return request({
        url: '/app/admin/package',
        method: 'put',
        data: data
    })
}

// 删除会员套餐
export function delPackage(ids) {
    return request({
        url: '/app/admin/package/' + ids,
        method: 'delete'
    })
}

// 修改套餐状态
export function changePackageStatus(data) {
    return request({
        url: '/app/admin/package/changeStatus',
        method: 'put',
        data: data
    })
}
