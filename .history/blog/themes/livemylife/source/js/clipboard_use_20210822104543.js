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
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });
    }
    initCopyCode();    
})

/**
   * 16进制 转 字节数组
   * @param hexString
   * @return
   */
 public static byte[] hexString2Bytes(String hexString) {
    BiFunction<Byte, Byte, Byte> uniteBytes = (src0, src1) -> {
        char b0 = (char) Byte.decode("0x" + new String(new byte[] {src0})).byteValue();
        b0 = (char) (b0 << 4);
        char b1 = (char) Byte.decode("0x" + new String(new byte[] {src1})).byteValue();
        return (byte) (b0 ^ b1);
    };
    int size = hexString.length();
    byte[] ret = new byte[size / 2];
    byte[] tmp = hexString.getBytes();
    for (int i = 0; i < size / 2; i++) {
        ret[i] = uniteBytes.apply(tmp[i * 2], tmp[i * 2 + 1]);
    }
    return ret;
}