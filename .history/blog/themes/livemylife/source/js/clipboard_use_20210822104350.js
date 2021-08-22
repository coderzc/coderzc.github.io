/*页面载入完成后，创建复制按钮*/
window.onload(() => {
    /* code */
    var initCopyCode = function(){
        var copyHtml = '';
        copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
        copyHtml += '  <i class="fa fa-globe"></i><span>copy</span>';
        copyHtml += '</button>';
        $(".highlight .code").before(copyHtml);
        new Clipboard('.btn-copy', {
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });
    }
    initCopyCode();
})
