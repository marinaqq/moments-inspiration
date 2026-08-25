App({
  globalData: {
    aiConfig: {
      apiKey: '', // 请在"我的→自定义API配置"中填入你的ModelScope API Key
      baseUrl: 'https://api-inference.modelscope.cn/v1/chat/completions',
      vlModel: 'Qwen/Qwen3-VL-8B-Instruct',
      textModel: 'Qwen/Qwen3-VL-8B-Instruct'
    }
  },
  onLaunch() {
    // 如果用户保存了自定义配置，覆盖默认
    const custom = wx.getStorageSync('customAiConfig')
    if (custom && custom.apiKey) {
      this.globalData.aiConfig = custom
    }
  }
})
