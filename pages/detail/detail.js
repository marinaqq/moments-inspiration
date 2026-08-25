const ai = require('../../utils/ai.js')
const storage = require('../../utils/storage.js')
const imageUtil = require('../../utils/image.js')
const app = getApp()

Page({
  data: {
    snapshot: null,
    captions: [],
    inspiration: null,
    imitatedCaptions: [],
    loading: false,
    loadingText: '',
    showImitate: false
  },

  onLoad(options) {
    const snapshot = storage.getById(options.id)
    this.setData({ snapshot })
  },

  previewImage(e) {
    const idx = e.currentTarget.dataset.idx
    wx.previewImage({
      current: this.data.snapshot.images[idx],
      urls: this.data.snapshot.images
    })
  },

  async generateCaptions() {
    this.setData({ loading: true, loadingText: '生成文案中...' })
    try {
      const captions = await ai.generateCaptions(this.data.snapshot)
      this.setData({ captions })
    } catch (err) {
      wx.showModal({ title: '生成失败', content: err.message, showCancel: false })
    } finally {
      this.setData({ loading: false })
    }
  },

  async extractInspiration() {
    this.setData({ loading: true, loadingText: '萃取灵感中...' })
    try {
      const inspiration = await ai.extractInspiration(this.data.snapshot)
      this.setData({ inspiration })
    } catch (err) {
      wx.showModal({ title: '萃取失败', content: err.message, showCancel: false })
    } finally {
      this.setData({ loading: false })
    }
  },

  async imitateStyle() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: async (res) => {
        that.setData({ loading: true, loadingText: '风格仿写中...' })
        try {
          const compressed = await imageUtil.compressAndSave(res.tempFiles[0].tempFilePath)
          const base64 = await imageUtil.imageToBase64(compressed)
          const captions = await ai.imitateStyle(that.data.snapshot, base64)
          that.setData({ imitatedCaptions: captions, showImitate: true })
        } catch (err) {
          wx.showModal({ title: '仿写失败', content: err.message, showCancel: false })
        } finally {
          that.setData({ loading: false })
        }
      }
    })
  },

  copyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  deleteSnapshot() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: (res) => {
        if (res.confirm) {
          storage.remove(this.data.snapshot.id)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1000)
        }
      }
    })
  }
})
