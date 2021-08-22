

/* code */
var initCopyCode = function(){
    clipboard = new ClipboardJS('.btn-copy', {
        container: $(".highlight .code")[0],
        target: function(trigger) {
            return trigger.nextElementSibling;
        }
    });

    clipboard.on('success', function(e) {
        e.clearSelection();
        e.trigger.getElementsByTagName("i")[0].className = 'fa fa-clipboard';
        e.trigger.getElementsByTagName("i")[0].innerText = ' copied'
        setTimeout(()=> {
            e.trigger.getElementsByTagName("i")[0].className = 'fa fa-copy';
            e.trigger.getElementsByTagName("i")[0].innerText = ' copy'
        }, 1000)
    });
}

/*页面载入完成后，创建复制按钮*/
$(function() {
    initCopyCode();    
})

