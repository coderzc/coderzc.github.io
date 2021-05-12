#### 题目描述
>给定一个已按照升序排列 的有序数组，找到两个数使得它们相加之和等于目标数。
函数应该返回这两个下标值 index1 和 index2，其中 index1 必须小于 index2。
说明:
返回的下标值（index1 和 index2）不是从零开始的。
你可以假设每个输入只对应唯一的答案，而且你不可以重复使用相同的元素。

>示例:
输入: numbers = [2, 7, 11, 15], target = 9
输出: [1,2]
解释: 2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。

#### 分析
>有序的查找想到二分查找，运用`对撞指针`的思想，前后各设置一个指针分别向中间移动

#### 代码
```java
      public static int binarySearch(int[] arr, int l, int k) {
        // 在[l...r]中查找k
        int r = arr.length - 1;
        while (l <= r) {
            int middle = l + ((r - l) >> 1);

            if (k == arr[middle])
                return middle;
            else if (k < arr[middle])
                r = middle - 1;
            else
                l = middle + 1;
        }

        return -1;
    }

    public int[] twoSum(int[] numbers, int target) {
        int[] ret = new int[2];
        for (int i = 0; i < numbers.length; i++) {
            int j = binarySearch(numbers, i + 1, target - numbers[i]);
            if ( j != -1) {
                ret[0]=i+1;
                ret[1]=j+1;
            }
        }
        return ret;
    }


    //O(n) 指针碰撞
    public int[] twoSum2(int[] numbers, int target) {
        int[] ret=new int[2];

        int l=0;
        int r=numbers.length-1;
        while (l<r){
            if(numbers[l]+numbers[r]==target) {
                ret[0]=l+1;
                ret[1]=r+1;
                return ret;
            }else if(numbers[l]+numbers[r]<target){
                l++;
            }else {
                r--;
            }
        }
        return ret;
    }
```
