const app = getApp()
const storage = require('../../utils/storage.js')

Page({
  data: {
    stats: { total: 0, tags: 0 },
    showAdvanced: false,
    customKey: '',
    customUrl: '',
    customModel: '',
    hasCustom: false
  },

  onLoad() {
    const custom = wx.getStorageSync('customAiConfig')
    if (custom && custom.apiKey) {
      this.setData({
        customKey: custom.apiKey || '',
        customUrl: custom.baseUrl || '',
        customModel: custom.vlModel || '',
        hasCustom: true
      })
    }
  },

  onShow() {
    this.loadStats()
  },

  loadStats() {
    const snapshots = storage.getAll()
    const tags = storage.getAllTags()
    this.setData({
      stats: { total: snapshots.length, tags: tags.length }
    })
  },

  toggleAdvanced() {
    this.setData({ showAdvanced: !this.data.showAdvanced })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  saveConfig() {
    const key = this.data.customKey.trim()
    if (!key) {
      wx.showToast({ title: '请输入API Key', icon: 'none' })
      return
    }
    const custom = {
      apiKey: key,
      baseUrl: this.data.customUrl.trim() || app.globalData.aiConfig.baseUrl,
      vlModel: this.data.customModel.trim() || app.globalData.aiConfig.vlModel,
      textModel: this.data.customModel.trim() || app.globalData.aiConfig.textModel
    }
    app.globalData.aiConfig = custom
    wx.setStorageSync('customAiConfig', custom)
    this.setData({ hasCustom: true })
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  clearConfig() {
    wx.removeStorageSync('customAiConfig')
    // 恢复默认配置
    app.globalData.aiConfig = {
      apiKey: '',
      baseUrl: 'https://api-inference.modelscope.cn/v1/chat/completions',
      vlModel: 'Qwen/Qwen3-VL-8B-Instruct',
      textModel: 'Qwen/Qwen3-VL-8B-Instruct'
    }
    this.setData({
      customKey: '',
      customUrl: '',
      customModel: '',
      hasCustom: false
    })
    wx.showToast({ title: '已恢复默认', icon: 'success' })
  },

  exportData() {
    const data = storage.getAll()
    const content = JSON.stringify(data, null, 2)
    wx.setClipboardData({
      data: content,
      success() {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  importData() {
    wx.getClipboardData({
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (Array.isArray(data)) {
            storage.importAll(data)
            wx.showToast({ title: '导入成功', icon: 'success' })
            this.loadStats()
          } else {
            wx.showToast({ title: '数据格式错误', icon: 'none' })
          }
        } catch (e) {
          wx.showToast({ title: '数据解析失败', icon: 'none' })
        }
      }
    })
  },

  clearData() {
    wx.showModal({
      title: '确认清空',
      content: '所有收藏数据将被删除，不可恢复',
      success: (res) => {
        if (res.confirm) {
          storage.clearAll()
          this.loadStats()
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
