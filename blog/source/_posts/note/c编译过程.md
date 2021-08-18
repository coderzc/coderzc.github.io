#### 源码：hello.c

```c
#include <stdio.h>
int main(){
 int a=88,b=89;
 char chars[]="你好 C";
    printf("%d %d %s\n",a,b,chars);
}
```

#### 预处理，生成预编译文件（.i文件）
* `gcc -E -o hello.i hello.c`

### hello.i 预编译文件
```c
# 1 "hello.c"
# 1 "<built-in>" 1
# 1 "<built-in>" 3
# 361 "<built-in>" 3
# 1 "<command line>" 1
# 1 "<built-in>" 2
# 1 "hello.c" 2
# 1 "/usr/include/stdio.h" 1 3 4
# 64 "/usr/include/stdio.h" 3 4
# 1 "/usr/include/_stdio.h" 1 3 4
# 68 "/usr/include/_stdio.h" 3 4
# 1 "/usr/include/sys/cdefs.h" 1 3 4
# 587 "/usr/include/sys/cdefs.h" 3 4
# 1 "/usr/include/sys/_symbol_aliasing.h" 1 3 4
# 588 "/usr/include/sys/cdefs.h" 2 3 4
# 653 "/usr/include/sys/cdefs.h" 3 4
# 1 "/usr/include/sys/_posix_availability.h" 1 3 4
# 654 "/usr/include/sys/cdefs.h" 2 3 4
# 69 "/usr/include/_stdio.h" 2 3 4
# 1 "/usr/include/Availability.h" 1 3 4
# 206 "/usr/include/Availability.h" 3 4
# 1 "/usr/include/AvailabilityInternal.h" 1 3 4
# 207 "/usr/include/Availability.h" 2 3 4
# 70 "/usr/include/_stdio.h" 2 3 4

# 1 "/usr/include/_types.h" 1 3 4
# 27 "/usr/include/_types.h" 3 4
# 1 "/usr/include/sys/_types.h" 1 3 4
# 33 "/usr/include/sys/_types.h" 3 4
# 1 "/usr/include/machine/_types.h" 1 3 4
# 32 "/usr/include/machine/_types.h" 3 4
# 1 "/usr/include/i386/_types.h" 1 3 4
# 37 "/usr/include/i386/_types.h" 3 4
typedef signed char __int8_t;
.......
```

#### # 编译，生成汇编代码（.s文件)
* `gcc -S -o hello.s hello.i`

#### hello.s (汇编代码)
```c
.section	__TEXT,__text,regular,pure_instructions
.build_version macos, 10, 14
.globl	_main                   ## -- Begin function main
.p2align	4, 0x90
_main:                                  ## @main
.cfi_startproc
## %bb.0:
pushq	%rbp
.cfi_def_cfa_offset 16
.cfi_offset %rbp, -16
movq	%rsp, %rbp
.cfi_def_cfa_register %rbp
subq	$32, %rsp
leaq	L_.str(%rip), %rdi
leaq	-17(%rbp), %rcx
movq	___stack_chk_guard@GOTPCREL(%rip), %rax
movq	(%rax), %rax
movq	%rax, -8(%rbp)
movl	$88, -24(%rbp)
movl	$89, -28(%rbp)
movq	L_main.chars(%rip), %rax
movq	%rax, -17(%rbp)
movb	L_main.chars+8(%rip), %dl
movb	%dl, -9(%rbp)
movl	-24(%rbp), %esi
movl	-28(%rbp), %edx
movb	$0, %al
callq	_printf
movq	___stack_chk_guard@GOTPCREL(%rip), %rcx
movq	(%rcx), %rcx
movq	-8(%rbp), %rdi
cmpq	%rdi, %rcx
movl	%eax, -32(%rbp)         ## 4-byte Spill
jne	LBB0_2
## %bb.1:
xorl	%eax, %eax
addq	$32, %rsp
popq	%rbp
retq
LBB0_2:
callq	___stack_chk_fail
ud2
.cfi_endproc
                                      ## -- End function
.section	__TEXT,__cstring,cstring_literals
L_main.chars:                           ## @main.chars
.asciz	"\344\275\240\345\245\275 C"

L_.str:                                 ## @.str
.asciz	"%d %d %s\n"


.subsections_via_symbols
```

#### 汇编，生成目标文件（.o文件）
* `gcc -c -o hello.o hello.s`

#### 链接，生成可执行文件（即windows下就是.exe）
* `gcc hello.s -o hello`

#### hello.s 与 hello.o 都是二进制文件


#### 直接生成可执行文件
`gcc hello.c -o hello`