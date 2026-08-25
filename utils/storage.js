const STORAGE_KEY = 'snapshots'

function getAll() {
  return wx.getStorageSync(STORAGE_KEY) || []
}

function getById(id) {
  const all = getAll()
  return all.find(item => item.id === id)
}

function add(snapshot) {
  const all = getAll()
  all.unshift(snapshot)
  wx.setStorageSync(STORAGE_KEY, all)
}

function update(id, updates) {
  const all = getAll()
  const idx = all.findIndex(item => item.id === id)
  if (idx !== -1) {
    all[idx] = Object.assign({}, all[idx], updates)
    wx.setStorageSync(STORAGE_KEY, all)
  }
}

function remove(id) {
  const all = getAll()
  const filtered = all.filter(item => item.id !== id)
  wx.setStorageSync(STORAGE_KEY, filtered)
  // 删除关联的图片文件
  const target = all.find(item => item.id === id)
  if (target && target.images) {
    const fs = wx.getFileSystemManager()
    target.images.forEach(path => {
      try { fs.unlinkSync(path) } catch (e) {}
    })
  }
}

function search(keyword) {
  const all = getAll()
  if (!keyword) return all
  const kw = keyword.toLowerCase()
  return all.filter(item => {
    return (item.text && item.text.toLowerCase().includes(kw)) ||
           (item.nickname && item.nickname.toLowerCase().includes(kw)) ||
           (item.summary && item.summary.toLowerCase().includes(kw)) ||
           (item.imageDesc && item.imageDesc.toLowerCase().includes(kw)) ||
           (item.tags && item.tags.some(t => t.toLowerCase().includes(kw)))
  })
}

function filterByTag(tag) {
  const all = getAll()
  if (!tag) return all
  return all.filter(item => item.tags && item.tags.includes(tag))
}

function getAllTags() {
  const all = getAll()
  const tagSet = new Set()
  all.forEach(item => {
    if (item.tags) {
      item.tags.forEach(t => tagSet.add(t))
    }
  })
  return Array.from(tagSet)
}

function getStats() {
  const all = getAll()
  const tags = getAllTags()
  return { total: all.length, tags: tags.length }
}

function clearAll() {
  const all = getAll()
  const fs = wx.getFileSystemManager()
  all.forEach(item => {
    if (item.images) {
      item.images.forEach(path => {
        try { fs.unlinkSync(path) } catch (e) {}
      })
    }
  })
  wx.setStorageSync(STORAGE_KEY, [])
}

function importAll(data) {
  wx.setStorageSync(STORAGE_KEY, data)
}

module.exports = {
  getAll,
  getById,
  add,
  update,
  remove,
  search,
  filterByTag,
  getAllTags,
  getStats,
  clearAll,
  importAll
}
