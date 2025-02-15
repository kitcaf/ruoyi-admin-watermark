import request from '@/utils/request'

// 查询订阅协议列表
export function listAgreement(query) {
    return request({
        url: '/app/admin/agreement/list',
        method: 'get',
        params: query
    })
}

// 查询订阅协议详细
export function getAgreement(id) {
    return request({
        url: '/app/admin/agreement/' + id,
        method: 'get'
    })
}

// 导出订阅协议
export function exportAgreement(query) {
    return request({
        url: '/app/admin/agreement/export',
        method: 'post',
        params: query
    })
}

