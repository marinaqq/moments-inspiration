// AI接口封装
const app = getApp()

function callAI(messages, model) {
  return new Promise((resolve, reject) => {
    const config = app.globalData.aiConfig
    wx.request({
      url: config.baseUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.apiKey
      },
      data: {
        model: model || config.vlModel,
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7
      },
      timeout: 60000,
      success(res) {
        if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
          resolve(res.data.choices[0].message.content)
        } else {
          console.error('AI response error:', res)
          reject(new Error((res.data && res.data.error && res.data.error.message) || 'AI服务返回异常(' + res.statusCode + ')'))
        }
      },
      fail(err) {
        console.error('AI request fail:', err)
        reject(new Error('网络请求失败: ' + (err.errMsg || JSON.stringify(err))))
      }
    })
  })
}

function parseJSON(text) {
  if (!text) return null
  // 去除markdown代码块
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    // 尝试提取第一个{...}块
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (e2) {
        return null
      }
    }
    return null
  }
}

// 分析截图：OCR + 图片理解 + 标签
function analyzeSnapshot(base64Data) {
  const config = app.globalData.aiConfig
  const messages = [
    {
      role: 'system',
      content: '你是一个朋友圈内容分析助手。用户会给你一张朋友圈截图，请分析并返回JSON格式（不要返回其他内容）：{"text":"截图中的朋友圈文字内容","nickname":"发布者昵称","imageDesc":"图片内容描述","tags":["标签1","标签2","标签3"],"summary":"一句话摘要"}。标签3-5个，简短。'
    },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64Data } },
        { type: 'text', text: '请分析这张朋友圈截图。' }
      ]
    }
  ]
  return callAI(messages, config.vlModel).then(content => {
    const parsed = parseJSON(content)
    if (parsed) return parsed
    return { text: content, nickname: '', imageDesc: '', tags: [], summary: content.substring(0, 50) }
  })
}

// 生成发圈文案
function generateCaptions(snapshot) {
  const config = app.globalData.aiConfig
  const messages = [
    {
      role: 'system',
      content: '你是一个朋友圈文案高手。根据用户提供的朋友圈内容，生成3条不同风格的发圈文案。只返回JSON数组格式：["文案1","文案2","文案3"]，每条15-40字，风格分别为文艺、幽默、简约。不要返回其他内容。'
    },
    {
      role: 'user',
      content: '原朋友圈内容：' + (snapshot.text || '') + '\n图片描述：' + (snapshot.imageDesc || '')
    }
  ]
  return callAI(messages, config.textModel).then(content => {
    const parsed = parseJSON(content)
    if (Array.isArray(parsed)) return parsed
    // 尝试提取数组
    const match = content.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const arr = JSON.parse(match[0])
        if (Array.isArray(arr)) return arr
      } catch (e) {}
    }
    return [content]
  })
}

// 灵感萃取
function extractInspiration(snapshot) {
  const config = app.globalData.aiConfig
  const messages = [
    {
      role: 'system',
      content: '你是一个内容创作灵感分析师。分析这条朋友圈的可借鉴之处，返回JSON：{"viewpoints":["观点1","观点2"],"writingStyle":"写作风格分析","reusablePattern":"可复用的表达模式"}。不要返回其他内容。'
    },
    {
      role: 'user',
      content: '朋友圈内容：' + (snapshot.text || '') + '\n图片描述：' + (snapshot.imageDesc || '')
    }
  ]
  return callAI(messages, config.textModel).then(content => {
    const parsed = parseJSON(content)
    if (parsed) return parsed
    return { viewpoints: [], writingStyle: content, reusablePattern: '' }
  })
}

// 风格仿写
function imitateStyle(snapshot, newBase64) {
  const config = app.globalData.aiConfig
  const content = [
    { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + newBase64 } },
    { type: 'text', text: '请参考以下朋友圈的写作风格，为我这张新图片写3条朋友圈文案。\n参考风格的朋友圈内容：' + (snapshot.text || '') + '\n只返回JSON数组：["文案1","文案2","文案3"]，每条15-40字。' }
  ]
  const messages = [
    { role: 'system', content: '你是一个朋友圈文案仿写高手，擅长模仿特定写作风格。只返回JSON数组，不要其他内容。' },
    { role: 'user', content: content }
  ]
  return callAI(messages, config.vlModel).then(content => {
    const parsed = parseJSON(content)
    if (Array.isArray(parsed)) return parsed
    const match = content.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const arr = JSON.parse(match[0])
        if (Array.isArray(arr)) return arr
      } catch (e) {}
    }
    return [content]
  })
}

module.exports = {
  analyzeSnapshot,
  generateCaptions,
  extractInspiration,
  imitateStyle
}
