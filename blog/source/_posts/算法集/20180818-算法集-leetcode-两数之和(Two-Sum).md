####题目描述

>给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。
你可以假设每个输入只对应一种答案，且同样的元素不能被重复利用。

>示例:
给定 nums = [2, 7, 11, 15], target = 9
因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]

####分析：
这是第一题很简单，就是两层for循环然后一个一个去试，结果代码倒是通过了，可是一看时间分析比大佬的代码慢好多，于是又看了第一名的代码，果然列害，通过HashMap以值为key如果发现与存在key正好匹配的数则返回，只遍历了一遍即可。
![image.png](https://gitee.com/coderzc/blogimage/raw/master/20210820163718.png)

####代码：

```java
    /**
     * 我的代码
     */
    public int[] twoSum(int[] nums, int target) {

        int[] ret = new int[2];
        for (int i = 0; i < nums.length; i++) {
            for (int j = 0; j < nums.length; j++) {
                if (j == i) continue;
                if (nums[i] + nums[j] == target) {
                    ret[0] = i;
                    ret[1] = j;
                    return ret;
                }
            }
        }

        return ret;
    }

    /**
     * 最优算法
     */
    public int[] twoSum2(int[] numbers, int target) {
        int[] res = new int[2];
        if (numbers == null || numbers.length < 2)
            return res;
        HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();
        for (int i = 0; i < numbers.length; i++) {
            if (!map.containsKey(target - numbers[i])) {
                map.put(numbers[i], i);
            } else {
                res[0] = map.get(target - numbers[i]);
                res[1] = i;
                break;
            }
        }
        return res;
    }
```