####题目描述
>Find the kth largest element in an unsorted array. Note that it is the kth largest element in the sorted order, not the kth distinct element.

>Example 1:
Input: [3,2,1,5,6,4] and k = 2
Output: 5
>Example 2:
Input: [3,2,3,1,2,4,5,5,6] and k = 4
Output: 4
Note: 
**You may assume k is always valid, 1 ≤ k ≤ array's length.**

####分析
>不用java的sort类库，用快排思想，Quick Select，划分为左面比p大右比p小，然后判断j与k的关系判断应该去那个子集继续查找

####代码
```java
    private static void swap(int arr[], int x, int y) {
        int temp = arr[x];
        arr[x] = arr[y];
        arr[y] = temp;
    }
    
    public int findKthLargest(int[] nums, int k) {

        if(nums==null||nums.length<k) return -1;

        int l=0;
        int r=nums.length-1;
        while (l<=r){
            int p=nums[l];
            int i=l+1;
            int j=r;
            while (true){
                while (i<=r&&nums[i]>p) i++;
                while (j>=l+1&&nums[j]<p) j--;

                if(i>=j) break;
                else swap(nums,i++,j--);
            }
            swap(nums,j,l);

            if(k==j+1) return p;
            else if(k<j+1) {r=j-1;}
            else {l=j+1;}
        }

        return -1;

    }
```

