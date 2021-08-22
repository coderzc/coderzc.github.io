/*页面载入完成后，创建复制按钮*/

$(function() {
    /* code */
    var initCopyCode = function(){
        var copyHtml = '';
        copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
        copyHtml += '  <i class="fa fa-globe"></i><span>copy</span>';
        copyHtml += '</button>';
        $(".highlight .code").before(copyHtml);
        new Clipboard('.btn-copy', {
            // target: function(trigger) {
            //     return trigger.nextElementSibling;
            // }
        });
    }
    initCopyCode();    
})

Mussum ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis porris, paradis. Paisis, filhis, espiritis santis. Mé faiz elementum girarzis, nisi eros vermeio, in elementis mé pra quem é amistosis quis leo. Manduma pindureta quium dia nois paga.