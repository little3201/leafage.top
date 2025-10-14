---
title: "Linux 下配置命令工具的解析"
excerpt: "安装各种服务有很多方法，但是可能会因为各种原因需要的版本不是系统默认的仓库中提供的"
date: "2022-03-13T09:11:44Z"
seo:
  tags: [
    "mvn",
    "linux",
    "link"
  ]
---

## 不修改环境变量文件，使得安装服务可以全局使用

以 maven 为例来进行说明，很多 linux 服务器上都会安装各种基础服务和软件，用来执行一些操作，例如 java 代码的编译、打包需要用 maven 工具，其有一个命令 mvn 来执行各种操作。

安装各种服务有很多方法，但是可能会因为各种原因需要的版本不是系统默认的仓库中提供的，例如 ubuntu 系统下默认 maven 版本号为 3.6.2，这个版本在编译 jdk 17的时候会有问题，所以需要更新到最新的版本 3.8.x 来解决这个问题。这时候只能下载最新的 maven 来编译安装。但是如果之前已经安装过了 maven ，这个时候不想破坏其之前的各种配置，该如果做呢？

首先我们先了解下 linux 下各版本的系统默认的工具都是如何安装的，以及初始化配置是怎么配置的。在 ubuntu 系统下，maven 文件会放在 /usr/share/maven 下，其中子目录 conf 软连接到 /etc/maven 目录、其中 /usr/share/maven/bin/m2.conf 文件软连接到 /etc/maven/m2.conf，这些是文件的存放目录和配置文件的路径。那接下来如何配置使得 mvn 命令工具能够全局使用，在很多文章中会让配置 /etc/profile 或者 .bashrc 或者 .profile文件，加上export /xxx/xxx 来实现。

同样的来看默认安装的 maven 是如何配置，通过命令：
```sh
whereis mvn
```
执行结果如下：
```bash
root@localhost:/usr/bin# whereis mvn
mvn: /usr/bin/mvn /usr/share/man/man1/mvn.1.gz
```
那看到了 mvn 的路径为： /usr/bin/mvn ，另外一个指向 mvn.1.gz可以不用管，默认安装的会在文件目录 /usr/share 下有一个xx.gz文件，里面是各种日志打印的东西，就是在安装时能看到的进度那些信息。

去 /usr/bin/ 看一下 mvn 的具体信息，它软连接到了 /etc/alternatives 目录下，如下所示：
![mvn 软连接1](https://img-blog.csdnimg.cn/c562697885a642ba9c337685b19c74dc.png)
那接着看 /etc/alternatives/mvn 这个的具体信息，如下：
![mvn 软连接2](https://img-blog.csdnimg.cn/b1b0e51f033d4fd48f5c92848c1eed21.png)
这里的软连接直接指向了具体 maven 存储目录中的脚本文件。

那为什么这里经过两个软连接就能够全局使用这个 mvn 命令工具了呢？
这里需要了解 linux 系统的软件多版本切换命令 update-alternatives，它的管理目录是：/etc/alternatives，它的管理方式就是在 /usr/bin 目录和 /etc/alternatives 目录下建立工具具体版本的软连接来保证多个版本的同一工具可运行，所以当在 /usr/bin 和 /etc/alternatives 目录下建立了具体执行脚本的软连接后，就可以全局执行这个脚本的命令。

> 建立软连接的命令，示例如下：
> ```bash
> ln -s /etc/maven conf
> ```
以上命令，在当前目录创建一个 conf 作为标识，指向 /etc/maven/ 目录；

大概了解后，来进行 maven 3.8.x 的配置。
1. 首先解压缩 apache-maven-xx.tar.gz 到 /usr/share/maven，具体命令示例如下：
```sh
tar -zxvf apache-maven-xx.tar.gz -C /usr/share/maven
```
2. 复制 /usr/share/maven 目录下的 conf 目录下的文件、bin 目录下的 m2.conf 文件到 /etc/maven 目录下，然后对两者建立软连接（修改源目录、文件名，然后建立，否则因为文件已存在，无法建立软连接）；
3. 进入到 /etc/alternatives 目录下，创建 mvn、 mvnDebug 的软连接，分别指向 /usr/share/maven/bin/mvn 和 /usr/share/maven/bin/mvnDebug;
4. 进入到 /usr/bin 目录下 ，创建 mvn、 mvnDebug 的软连接，分别指向 /etc/alternatives/mvn 和 /etc/alternatives/mvnDebug；
5. 完成之后，在任意目录下执行 mvn -v 命令查看 maven 版本信息，看是否可行。一般到这里会成功执行并看到如下信息：
```sh
root@localhost:/usr/bin# mvn -v
Apache Maven 3.8.4 (9b656c72xxxxxxx159fe39b537)
Maven home: /usr/share/maven
Java version: 17.0.1, vendor: Private Build, runtime: /usr/lib/jvm/java-17-openjdk-amd64
// 其余省略
```

并不需要修改任何的环境配置，而且这种方式更安全，不会影响其他已经存在的配置，当然如果覆盖了之前的文件或者配置的情况除外。