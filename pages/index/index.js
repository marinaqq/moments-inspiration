const storage = require('../../utils/storage.js')

Page({
  data: {
    snapshots: [],
    filteredSnapshots: [],
    tags: [],
    activeTag: '',
    keyword: ''
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  loadData() {
    const snapshots = storage.getAll()
    const tags = storage.getAllTags()
    this.setData({
      snapshots,
      tags,
      filteredSnapshots: this.filterList(snapshots, this.data.keyword, this.data.activeTag)
    })
  },

  filterList(list, keyword, tag) {
    let result = list
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(item => {
        return (item.text && item.text.toLowerCase().includes(kw)) ||
               (item.nickname && item.nickname.toLowerCase().includes(kw)) ||
               (item.summary && item.summary.toLowerCase().includes(kw)) ||
               (item.tags && item.tags.some(t => t.toLowerCase().includes(kw)))
      })
    }
    if (tag) {
      result = result.filter(item => item.tags && item.tags.includes(tag))
    }
    return result
  },

  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      keyword,
      filteredSnapshots: this.filterList(this.data.snapshots, keyword, this.data.activeTag)
    })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    const activeTag = this.data.activeTag === tag ? '' : tag
    this.setData({
      activeTag,
      filteredSnapshots: this.filterList(this.data.snapshots, this.data.keyword, activeTag)
    })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  },

  goAdd() {
    wx.switchTab({ url: '/pages/add/add' })
  }
})
