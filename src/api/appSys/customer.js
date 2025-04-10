import request from '@/utils/request'

// 获取当前客服二维码
export function getCurrentQrCode() {
  return request({
    url: '/app/admin/qrcode/current',
    method: 'get'
  })
}

// 上传客服二维码
export function uploadQrCode(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/app/admin/qrcode/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
