import request from '@/utils/request'

// 查询APP用户列表
export function listUser(query) {
  return request({
    url: '/app/admin/user/list',
    method: 'get',
    params: query
  })
}

// 查询APP用户详细
export function getUser(id) {
  return request({
    url: '/app/admin/user/' + id,
    method: 'get'
  })
}

// 新增APP用户
export function addUser(data) {
  return request({
    url: '/app/admin/user',
    method: 'post',
    data: data
  })
}

// 修改APP用户
export function updateUser(data) {
  return request({
    url: '/app/admin/user',
    method: 'put',
    data: data
  })
}

// 删除APP用户
export function delUser(ids) {
  return request({
    url: '/app/admin/user/' + ids,
    method: 'delete'
  })
}

// 重置用户使用次数
export function resetTimes(id, times) {
  return request({
    url: `/app/admin/user/resetTimes/${id}`,
    method: 'put',
    params: { times }
  })
}



// 修改用户有效期
export function updateExpireTime(id, expireTime) {
  const formattedTime = formatDateTime(expireTime)
  return request({
    url: `/app/admin/user/updateExpireTime/${id}`,
    method: 'put',
    params: { expireTime: formattedTime }
  })
}

// 格式化日期时间
function formatDateTime(date) {
  if (!date) return undefined
  const d = new Date(date)
  const pad = (num) => (num < 10 ? '0' + num : num)
  
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
