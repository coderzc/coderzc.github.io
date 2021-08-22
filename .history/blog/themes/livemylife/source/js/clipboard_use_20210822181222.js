/*页面载入完成后，创建复制按钮*/

$(function() {
    /* code */
    var initCopyCode = function(){
        var copyHtml = '';
        copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
        copyHtml += '<i class="fa fa-copy">复制</i>';
        copyHtml += '</button>';
        $(".highlight .code").before(copyHtml);
        clipboard = new ClipboardJS('.btn-copy', {
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });

        clipboard.on('success', function(e) {
            e.clearSelection();
            e.trigger.getElementsByTagName("i")[0].className = 'fa fa-clipboard';
            setTimeout(()=> {
                e.trigger.getElementsByTagName("i")[0].className = 'fa fa-copy';
            }, 1500)
        });
    }
    initCopyCode();
})

