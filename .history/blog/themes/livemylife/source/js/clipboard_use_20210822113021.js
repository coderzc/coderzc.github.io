/*页面载入完成后，创建复制按钮*/

$(function() {
    /* code */
    var initCopyCode = function(){
        var copyHtml = '';
        copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
        copyHtml += '<span>复制</span>';
        copyHtml += '</button>';
        $(".highlight .code").before(copyHtml);
        clipboard = new ClipboardJS('.btn-copy', {
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });

        clipboard.on('success', function(e) {
            e.clearSelection();
            console.log('e.target',e.trigger)
            console.log(e.trigger.getElementsByTagName("span"))
            e.trigger.getElementsByTagName("span").innerText = '复制成功';
            setTimeout(()=> {
                e.trigger.getElementsByTagName("span").innerText = '复制';
            }, 1000)
        });
    }
    initCopyCode();    
})

