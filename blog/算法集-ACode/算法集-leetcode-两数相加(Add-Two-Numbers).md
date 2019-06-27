####题目描述：
>给定两个非空链表来表示两个非负整数。位数按照逆序方式存储，它们的每个节点只存储单个数字。将两数相加返回一个新的链表。
>你可以假设除了数字 0 之外，这两个数字都不会以零开头。

>示例：
输入：(2 -> 4 -> 3) + (5 -> 6 -> 4)
输出：7 -> 0 -> 8
原因：342 + 465 = 807

####分析：
这道题就是模拟加法手算过程，主要是对边界值的判断，尤其是两组不等长最后一位的处理，像999+1这种要一直进位。

####代码：
```java
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode pre=new ListNode(0);
        ListNode head=pre;
        while (l1 != null && l2 != null) {
            int sum = l1.val + l2.val;
            int a = -1; //进位
            if (sum >= 10) {
                a = 1;
                pre.next=new ListNode(sum % 10);
                pre=pre.next;
            } else {
                pre.next=new ListNode(sum);
                pre=pre.next;
            }
            l1 = l1.next;
            l2 = l2.next;

            if(a==-1) continue;

            if (l2 == null & l1 == null) {
                pre.next=new ListNode(a);
                pre=pre.next;
            } else if (l2 == null && l1 != null) {
                l1.val += a;
            } else {
                l2.val += a;
            }
        }

        if (l1 == null && l2 != null) {
            while (l2 != null) {
                if(l2.val>=10){
                    int a=l2.val%10;
                    l2.val=a;
                    if(l2.next!=null){
                        l2.next.val+=1;
                    }else {
                        l2.next=new ListNode(1);
                    }
                }
                pre.next=new ListNode(l2.val);
                pre=pre.next;
                l2 = l2.next;
            }
        }

        if (l1 != null && l2 == null) {
            while (l1 != null) {
                if(l1.val>=10){
                    int a=l1.val%10;
                    l1.val=a;
                    if(l1.next!=null){
                        l1.next.val+=1;
                    }else {
                        l1.next=new ListNode(1);
                    }
                }
                pre.next=new ListNode(l1.val);
                pre=pre.next;
                l1 = l1.next;
            }
        }

        return head.next;
    }
```
