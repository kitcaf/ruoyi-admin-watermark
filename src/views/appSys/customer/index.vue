<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客服二维码管理</span>
        </div>
      </template>
      <div class="qrcode-container">
        <div class="upload-section">
          <el-upload class="upload-demo" :action="uploadUrl" :show-file-list="false" :on-success="handleUploadSuccess"
            :on-error="handleUploadError" :before-upload="beforeUpload" :headers="headers">
            <el-button type="primary">上传客服二维码</el-button>
          </el-upload>
        </div>

        <div class="preview-section">
          <h3>当前客服二维码</h3>
          <div v-if="qrcodeUrl" class="qrcode-preview">
            <img :src="baseUrl + qrcodeUrl" alt="客服二维码" />
          </div>
          <el-empty v-else description="暂无客服二维码，请上传"></el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentQrCode, uploadQrCode } from '@/api/appSys/customer'
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance()
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadUrl = baseUrl + '/app/admin/qrcode/upload'
const headers = ref({ Authorization: 'Bearer ' + getToken() })

// 二维码URL
const qrcodeUrl = ref('')
const loading = ref(false)

// 获取当前二维码
const getQrCode = () => {
  loading.value = true
  getCurrentQrCode()
    .then(res => {
      if (res.code === 200) {
        qrcodeUrl.value = res.url
      }
    })
    .catch(err => {
      console.error('获取二维码失败:', err)
    })
    .finally(() => {
      loading.value = false
    })
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    proxy.$modal.msgError('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    proxy.$modal.msgError('图片大小不能超过 5MB!')
    return false
  }

  proxy.$modal.loading('正在上传图片，请稍候...')
  return true
}

// 上传成功回调
const handleUploadSuccess = (res) => {
  proxy.$modal.closeLoading()
  if (res.code === 200) {
    proxy.$modal.msgSuccess('上传成功')
    qrcodeUrl.value = res.url
  } else {
    proxy.$modal.msgError(res.msg || '上传失败')
  }
}

// 上传失败回调
const handleUploadError = () => {
  proxy.$modal.closeLoading()
  proxy.$modal.msgError('上传失败，请重试')
}

// 页面加载时获取当前二维码
onMounted(() => {
  getQrCode()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.upload-section {
  margin-bottom: 20px;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-preview {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.qrcode-preview img {
  max-width: 300px;
  max-height: 300px;
}

h3 {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}
</style>
