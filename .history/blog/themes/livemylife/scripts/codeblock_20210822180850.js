var attributes = [
    'autocomplete="off"',
    'autocorrect="off"',
    'autocapitalize="off"',
    'spellcheck="false"',
    'contenteditable="false"'
  ]
  
  var attributesStr = attributes.join(' ')
  
  hexo.extend.filter.register('after_post_render', function (data) {
    while (/<figure class="highlight ([a-zA-Z]+)">.*?<\/figure>/.test(data.content)) {
      data.content = data.content.replace(/<figure class="highlight ([a-zA-Z]+)">.*?<\/figure>/, function () {
        var language = RegExp.$1 || 'plain'
        var lastMatch = RegExp.lastMatch
        lastMatch = lastMatch.replace(/<figure class="highlight /, '<figure class="iseeu highlight /')
        return `
          <div class="highlight-wrap" ${attributesStr}data-rel='${language.toUpperCase()}'>
          // <div class="btn-copy">
          // <i class="fa fa-copy"> 复制</i>
          // </div>
          ${lastMatch}
          </div>
          `
      })
    }
    return data
  })