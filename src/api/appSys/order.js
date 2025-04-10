import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
    return request({
        url: '/app/admin/pay/list',
        method: 'get',
        params: query
    })
}

// 获取订单统计
export function getOrderStats() {
    return request({
        url: '/app/admin/pay/stats',
        method: 'get'
    })
}

// 导出订单
export function exportOrder(query) {
    return request({
        url: '/app/admin/pay/export',
        method: 'post',
        data: query,
        responseType: 'blob'
    })
}
