/*页面载入完成后，创建复制按钮*/

$(function() {
    /* code */
    var initCopyCode = function(){
        var copyHtml = '';
        copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
        copyHtml += '<>';
        copyHtml += '</button>';
        $(".highlight .code").before(copyHtml);
        clipboard = new ClipboardJS('.btn-copy', {
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });

        clipboard.on('success', function(e) {
            e.clearSelection();
            e.text = '复制成功'
            e.trigger.getElementsByTagName("span")[0].innerText = '复制成功';
            setTimeout(()=> {
                e.trigger.getElementsByTagName("span")[0].innerText = '复制';
            }, 1000)
        });
    }
    initCopyCode();    
})

