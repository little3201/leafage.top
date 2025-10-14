---
title: "Mongo 服务重启异常问题记录"
excerpt: "服务器经常性断电，所以要经常性重启所有的服务，然而这些redis、mysql、mongo等服务中，mongo经常性出现重启失败的情况，根据之前的经验和网络上帖子的信息"
date: "2021-06-28T07:13:53Z"
seo:
  tags: [
    "mvn",
    "linux",
    "link"
  ]
---

服务器经常性断电，所以要经常性重启所有的服务，然而这些redis、mysql、mongo等服务中，mongo经常性出现重启失败的情况，根据之前的经验和网络上帖子的信息，这里记录一下总结；

> 首先说明一下，这里安装的服务都是通过yum 或者 apt 安装的，这是我一直推荐和使用的操作，因为这样安装整洁、该放什么类型的文件到哪个目录下都是一样的（如：/var/log/xxx/xxx.log）

报错主要问题如下：
```bash
[root@localhost mongo]# systemctl status mongod
● mongod.service - MongoDB Database Server
   Loaded: loaded (/usr/lib/systemd/system/mongod.service; enabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since 一 2021-06-28 14:32:51 CST; 6s ago
     Docs: https://docs.mongodb.org/manual
  Process: 3351 ExecStart=/usr/bin/mongod $OPTIONS (code=exited, status=1/FAILURE)
  Process: 3348 ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb (code=exited, status=0/SUCCESS)
  Process: 3345 ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb (code=exited, status=0/SUCCESS)
  Process: 3343 ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb (code=exited, status=0/SUCCESS)

6月 28 14:32:51 localhost systemd[1]: Starting MongoDB Database Server...
6月 28 14:32:51 localhost mongod[3351]: about to fork child process, waiting until server is ready for connections.
6月 28 14:32:51 localhost mongod[3351]: forked process: 3354
6月 28 14:32:51 localhost mongod[3351]: ERROR: child process failed, exited with 1
6月 28 14:32:51 localhost mongod[3351]: To see additional information in this output, start without the "--fork" option.
6月 28 14:32:51 localhost systemd[1]: mongod.service: control process exited, code=exited status=1
6月 28 14:32:51 localhost systemd[1]: Failed to start MongoDB Database Server.
6月 28 14:32:51 localhost systemd[1]: Unit mongod.service entered failed state.
6月 28 14:32:51 localhost systemd[1]: mongod.service failed.
```
看到异常的发生，并不能从其中获取到非常有效的信息，那就先去看下日志，在日志文件中可以看到一些有用的信息（这里没有及时记录截图，就先不放代码或截图了）

### 处理步骤：

1. 使用mongo提供的修复工具，执行一下命令：
```sh
mongod --repair -f /etc/mongod.conf
```
> 这里说明下，有的帖子说，执行第一步之后，执行启动命令（如下所示：），其中携带指向新的dbpath和logpath参数，这样也能起来，但是你数据就丢了，而且不能每次都给指向新的目录吧。
```sh
mongod --port 27017 --dbpath /data/db  --logpath /var/log/mongod.log --fork
```

2. 检查mongo的dbpath目录（默认：/var/lib/mongodb）下是否存在mongod.lock文件，如果有，将其删除；

3. 检查dbpath目录（默认：/var/lib/mongodb），日志目录（默认：/var/lib/mongo）权限的问题，是否mongod.mongod 拥有操作权限，如果没有，就给mongod.mongod授权：
```sh
chown -Rc mongod. /var/log/mongodb

chown -Rc mongod. /var/lib/mongo
```
以上步骤执行完成，就能够重新启动mongodb服务了。
