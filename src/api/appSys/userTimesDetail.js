import request from '@/utils/request'

// 查询用户次数明细列表
export function listTimesDetail(query) {
  return request({
    url: '/app/admin/times/list',
    method: 'get',
    params: query
  })
}

// 查询用户次数明细详细
export function getTimesDetail(id) {
  return request({
    url: '/app/admin/times/' + id,
    method: 'get'
  })
}

// 新增用户次数
export function addTimes(data) {
  return request({
    url: '/app/admin/times/add',
    method: 'post',
    data: data
  })
}

// 删除用户次数明细
export function delTimesDetail(ids) {
  return request({
    url: '/app/admin/times/' + ids,
    method: 'delete'
  })
}

// 手动发放每日次数
export function grantDailyTimes(userId) {
  return request({
    url: '/app/admin/times/grant/' + userId,
    method: 'post'
  })
}

// 获取用户当前可用次数
export function getAvailableTimes(userId) {
  return request({
    url: '/app/admin/times/available/' + userId,
    method: 'get'
  })
}
