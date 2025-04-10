import request from '@/utils/request'

// 查询激活码列表
export function listCode(query) {
    return request({
        url: '/app/admin/code/list',
        method: 'get',
        params: query
    })
}

// 查询激活码详细
export function getCode(id) {
    return request({
        url: '/app/admin/code/' + id,
        method: 'get'
    })
}

// 新增激活码
export function addCode(data, type) {
    return request({
        url: '/app/admin/code',
        method: 'post',
        params: { type },
        data: data
    })
}

// 修改激活码
export function updateCode(data) {
    return request({
        url: '/app/admin/code',
        method: 'put',
        data: data
    })
}

// 删除激活码
export function delCode(ids) {
    return request({
        url: '/app/admin/code/' + ids,
        method: 'delete'
    })
}

// 修改激活码状态
export function changeCodeStatus(data) {
    return request({
        url: '/app/admin/code/changeStatus',
        method: 'put',
        data: data
    })
}
