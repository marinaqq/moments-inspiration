// 图片处理工具

function compressAndSave(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: tempFilePath,
      quality: 60,
      success(res) {
        const fs = wx.getFileSystemManager()
        const savedPath = `${wx.env.USER_DATA_PATH}/snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.jpg`
        fs.saveFile({
          tempFilePath: res.tempFilePath,
          filePath: savedPath,
          success(saveRes) {
            resolve(saveRes.savedFilePath)
          },
          fail(err) {
            // saveFile可能不支持指定filePath，用copyFile
            fs.copyFile({
              srcPath: res.tempFilePath,
              destPath: savedPath,
              success() { resolve(savedPath) },
              fail: reject
            })
          }
        })
      },
      fail: reject
    })
  })
}

function processImages(tempFilePaths) {
  return Promise.all(tempFilePaths.map(path => compressAndSave(path)))
}

function imageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    fs.readFile({
      filePath: filePath,
      encoding: 'base64',
      success(res) {
        resolve(res.data)
      },
      fail: reject
    })
  })
}

module.exports = {
  compressAndSave,
  processImages,
  imageToBase64
}
