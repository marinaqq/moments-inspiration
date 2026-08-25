const ai = require('../../utils/ai.js')
const imageUtil = require('../../utils/image.js')
const storage = require('../../utils/storage.js')
const app = getApp()

Page({
  data: {
    images: [],
    analyzing: false,
    showResult: false,
    form: {
      nickname: '',
      text: '',
      imageDesc: '',
      tags: [],
      summary: ''
    },
    tagInput: '',
    textOnly: false,
    textOnlyContent: ''
  },

  chooseImage() {
    const that = this
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const newPaths = res.tempFiles.map(f => f.tempFilePath)
        that.setData({
          images: that.data.images.concat(newPaths)
        })
      }
    })
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.idx
    const images = this.data.images
    images.splice(idx, 1)
    this.setData({ images })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.idx
    wx.previewImage({
      current: this.data.images[idx],
      urls: this.data.images
    })
  },

  async analyzeImages() {
    if (this.data.images.length === 0) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }
    if (!app.globalData.aiConfig.apiKey) {
      wx.showToast({ title: '请先在"我的"中配置API Key', icon: 'none' })
      return
    }

    this.setData({ analyzing: true })
    wx.showLoading({ title: 'AI识别中...', mask: true })

    try {
      // 压缩并保存第一张图片用于分析
      const compressedPaths = await imageUtil.processImages(this.data.images)
      // 用第一张图做AI分析
      const base64 = await imageUtil.imageToBase64(compressedPaths[0])
      const result = await ai.analyzeSnapshot(base64)

      this.setData({
        showResult: true,
        form: {
          nickname: result.nickname || '',
          text: result.text || '',
          imageDesc: result.imageDesc || '',
          tags: result.tags || [],
          summary: result.summary || ''
        },
        compressedPaths: compressedPaths
      })
    } catch (err) {
      console.error('AI analyze error:', err)
      wx.showModal({
        title: '识别失败',
        content: err.message || '请检查网络和API配置',
        showCancel: false
      })
    } finally {
      this.setData({ analyzing: false })
      wx.hideLoading()
    }
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onTagInput(e) {
    this.setData({ tagInput: e.detail.value })
  },

  addTag() {
    const tag = this.data.tagInput.trim()
    if (tag && !this.data.form.tags.includes(tag)) {
      this.setData({
        'form.tags': this.data.form.tags.concat(tag),
        tagInput: ''
      })
    }
  },

  removeTag(e) {
    const idx = e.currentTarget.dataset.idx
    const tags = this.data.form.tags
    tags.splice(idx, 1)
    this.setData({ 'form.tags': tags })
  },

  async saveSnapshot() {
    if (!this.data.form.text && this.data.images.length === 0 && !this.data.textOnlyContent) {
      wx.showToast({ title: '内容不能为空', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...', mask: true })

    try {
      let savedPaths = []
      if (this.data.compressedPaths) {
        savedPaths = this.data.compressedPaths
      } else if (this.data.images.length > 0) {
        savedPaths = await imageUtil.processImages(this.data.images)
      }

      const snapshot = {
        id: Date.now().toString(),
        images: savedPaths,
        nickname: this.data.form.nickname,
        text: this.data.textOnly ? this.data.textOnlyContent : this.data.form.text,
        imageDesc: this.data.form.imageDesc,
        tags: this.data.form.tags,
        summary: this.data.form.summary,
        createdAt: new Date().toISOString()
      }

      storage.add(snapshot)
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })

      setTimeout(() => {
        this.setData({
          images: [],
          showResult: false,
          form: { nickname: '', text: '', imageDesc: '', tags: [], summary: '' },
          textOnly: false,
          textOnlyContent: ''
        })
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      wx.showModal({
        title: '保存失败',
        content: err.message || '请重试',
        showCancel: false
      })
    }
  },

  toggleTextOnly() {
    this.setData({ textOnly: !this.data.textOnly })
  },

  onTextOnlyInput(e) {
    this.setData({ textOnlyContent: e.detail.value })
  }
})
