---
title: "Nginx 应用配置记录"
excerpt: "Nginx 在实际项目应用中的基础配置。"
date: "2021-09-26T00:28:26Z"
seo:
  tags: [
    "nginx",
    "nginx.conf",
    "http",
    "location",
    "events"
  ]
---

### 安装
推荐使用系统命令进行安装，例如：centos 下使用 yum install nginx 命令，ubuntu 下使用 apt-get install nginx 命令。这样的好处是，可以直接配置系统重启自启动，另外可以使用全局命令来操作 nginx 。

> 默认情况下，linux 环境被安装在 /etc/nginx。

### 使用

#### 常用到的命令如下：
1.快速关闭Nginx，可能不保存相关信息，并迅速终止web服务。
```sh
nginx -s stop
```
2.平稳关闭Nginx，保存相关信息，有安排的结束web服务。
```sh
nginx -s quit 
```
3.因改变了Nginx相关配置，需要重新加载配置而重载。
```sh
nginx -s reload
``` 
4.重新打开日志文件。
```sh
nginx -s reopen
```
5.为 Nginx 指定一个配置文件，来代替缺省的。
```sh
nginx -c filename
```
6.不运行，而仅仅测试配置文件。nginx 将检查配置文件的语法的正确性，并尝试打开配置文件中所引用到的文件。
```sh
nginx -t
```
7.显示 nginx 的版本。
```sh
nginx -v
```
8.显示 nginx 的版本，编译器版本和配置参数。
```sh
nginx -V
```
如果不想每次都敲命令，可以在nginx安装目录下新添一个启动批处理文件startup.bat，双击即可运行。

### 配置

Nginx 的主配置文件是 nginx.conf，这个配置文件一共由三部分组成，分别为全局块、events 块和 http 块。在 http 块中，又包含 http 全局块、多个 server 块。每个 server 块中，可以包含 server 全局块和多个 location 块。在同一配置块中嵌套的配置块，各个之间不存在次序关系。<mark>nginx 配置文件内容，重复配置时，后面的配置会覆盖前面的内容。</mark>

```nginx
... #全局块
events { #events块
...
}

http #http块
{
    ... #http全局块

    server #server块
    { 
        ... #server全局块
        location [PATTERN] #location块
        {
            ...
        }
        location [PATTERN] 
        {
            ...
        }
     }

    server
    {
        ...
    }

    ... #http全局块
}
```

**1. 全局块：**
全局块是默认配置文件从开始到events块之间的一部分内容，主要设置一些影响Nginx服务器整体运行的配置指令，因此，这些指令的作用域是Nginx服务器全局。

通常包括配置运行Nginx服务器的用户（组）、允许生成的worker process数、Nginx进程PID存放路径、日志的存放路径和类型以及配置文件引入等

**2. events 块：**
events块涉及的指令主要影响Nginx服务器与用户的网络连接。常用到的设置包括是否开启对多worker process下的网络连接进行序列化，是否允许同时接收多个网络连接，选取哪种事件驱动模型处理连接请求，每个worker process可以同时支持的最大连接数等。

这一部分的指令对Nginx服务器的性能影响较大，在实际配置中应该根据实际情况灵活调整

**3. http 块：**
http块是Nginx服务器配置中的重要部分，代理、缓存和日志定义等绝大多数的功能和第三方模块的配置都可以放在这个模块中。

前面已经提到，http块中可以包含自己的全局块，也可以包含server块，server块中又可以进一步包含location块，在本书中我们使用“http全局块”来表示http中自己的全局块，即http块中不包含在server块中的部分。

可以在http全局块中配置的指令包括文件引入、MIME-Type定义、日志自定义、是否使用sendfile传输文件、连接超时时间、单连接请求数上限等。

- server 块：

server块和“虚拟主机”的概念有密切联系。

虚拟主机，又称虚拟服务器、主机空间或是网页空间，它是一种技术。该技术是为了节省互联网服务器硬件成本而出现的。这里的“主机”或“空间”是由实体的服务器延伸而来，硬件系统可以基于服务器群，或者单个服务器等。虚拟主机技术主要应用于HTTP、FTP及EMAIL等多项服务，将一台服务器的某项或者全部服务内容逻辑划分为多个服务单位，对外表现为多个服务器，从而充分利用服务器硬件资源。从用户角度来看，一台虚拟主机和一台独立的硬件主机是完全一样的。

在使用Nginx服务器提供Web服务时，利用虚拟主机的技术就可以避免为每一个要运行的网站提供单独的Nginx服务器，也无需为每个网站对应运行一组Nginx进程。虚拟主机技术使得Nginx服务器可以在同一台服务器上只运行一组Nginx进程，就可以运行多个网站。

在前面提到过，每一个http块都可以包含多个server块，而每个server块就相当于一台虚拟主机，它内部可有多台主机联合提供服务，一起对外提供在逻辑上关系密切的一组服务（或网站）。

和http块相同，server块也可以包含自己的全局块，同时可以包含多个location块。在server全局块中，最常见的两个配置项是本虚拟主机的监听配置和本虚拟主机的名称或IP配置。

```nginx
server {
    listen              443 ssl http2;
    listen              [::]:443 ssl http2;
    server_name         domain.com *.domain.com;
    root                /var/www/domain/dist;

    # SSL
    ssl_certificate     /etc/nginx/ssl/domain.com.pem;
    ssl_certificate_key /etc/nginx/ssl/domain.com.key;

    # security
    include             sites-available/security.conf;
  
    # index.html fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        include    sites-available/proxy.conf;
    }

    # allow safe files
    location ~* \.(?:css(\.map)?|js(\.map)?|ttf|ttc|otf|eot|woff2?|svgz?|jpe?g|png|gif|ico|cur|heic|webp|tiff?|mp3|m4a|aac|ogg|midi?|wav|mp4|mov|webm|mpe?g|avi|ogv|flv|wmv|pdf|docx?|dotx?|docm|dotm|xlsx?|xltx?|xlsm|xltm|pptx?|potx?|pptm|potm|ppsx?)$ {
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public";
        expires    30d;
    }

    # additional config
    include sites-available/general.conf;
}

# HTTP redirect
server {
    listen      80;
    listen      [::]:80;
    server_name .domain.com;
    return      301 https://domain.com$request_uri;
}

```

关于重复的配置，提取到单独的配置文件中，然后使用时 include 即可，这样简介，方便维护，例如上面配置示例中，security.conf 和 general.conf 文件；

security.conf 的内容如下：

```nginx
# security headers
add_header X-XSS-Protection          "1 ; mode=block" always;
add_header X-Content-Type-Options    "nosniff" always;
add_header Referrer-Policy           "no-referrer-when-downgrade" always;
add_header Content-Security-Policy   "default-src 'self' http: https: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;
add_header Permissions-Policy        "interest-cohort=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# . files
location ~ /\.(?!well-known) {
    deny all;
}

```

proxy.conf 的内容如下：
```nginx
proxy_http_version                 1.1;
proxy_cache_bypass                 $http_upgrade;

# Proxy headers
proxy_set_header Upgrade           $http_upgrade;
proxy_set_header Connection        $connection_upgrade;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header Forwarded         $proxy_add_forwarded;
proxy_set_header X-Forwarded-For   "";
proxy_set_header X-Forwarded-Proto "";
proxy_set_header X-Forwarded-Host  "";
proxy_set_header X-Forwarded-Port  "";

# Proxy timeouts
proxy_connect_timeout              60s;
proxy_send_timeout                 60s;
proxy_read_timeout                 60s;
```

general.conf 的内容如下：

```nginx
# favicon.ico
location = /favicon.ico {
    log_not_found off;
    access_log    off;
}

# robots.txt
location = /robots.txt {
    log_not_found off;
    access_log    off;
}

# gzip
include         sites-available/gzip.conf;
```

gzip.conf 配置内容如下：

```nginx
# gzip
gzip            on;
gzip_vary       on;
gzip_proxied    any;
gzip_comp_level 6;
gzip_types      text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
```

- location 块：

每个server块中可以包含多个location块。在整个Nginx配置文档中起着重要的作用，而且Nginx服务器在许多功能上的灵活性往往在location指令的配置中体现出来。

location块的主要作用是，基于Nginx服务器接收到的请求字符串（例如， server_name/uri-string），对除虚拟主机名称（也可以是IP别名，后文有详细阐述）之外的字符串（前例中“/uri-string”部分）进行匹配，对特定的请求进行处理。地址定向、数据缓存和应答控制等功能都是在这部分实现。许多第三方模块的配置也是在location块中提供功能。

在Nginx的官方文档中定义的location的语法结构为：

location [ = | ~ | ~* | ^~ ] uri { ... }
其中，uri变量是待匹配的请求字符串，可以是不含正则表达的字符串，如/myserver.php等；也可以是包含有正则表达的字符串，如 .php$（表示以.php结尾的URL）等。为了下文叙述方便，我们约定，不含正则表达的uri称为“标准uri”，使用正则表达式的uri称为“正则uri”。

其中方括号里的部分，是可选项，用来改变请求字符串与 uri 的匹配方式。在介绍四种标识的含义之前，我们需要先了解不添加此选项时，Nginx服务器是如何在server块中搜索并使用location块的uri和请求字符串匹配的。

在不添加此选项时，Nginx服务器首先在server块的多个location块中搜索是否有标准uri和请求字符串匹配，如果有多个可以匹配，就记录匹配度最高的一个。然后，服务器再用location块中的正则uri和请求字符串匹配，当第一个正则uri匹配成功，结束搜索，并使用这个location块处理此请求；如果正则匹配全部失败，就使用刚才记录的匹配度最高的location块处理此请求。

了解了上面的内容，就可以解释可选项中各个标识的含义了：

- “=”，用于标准uri前，要求请求字符串与uri严格匹配。如果已经匹配成功，就停止继续向下搜索并立即处理此请求。

- “^～”，用于标准uri前，要求Nginx服务器找到标识uri和请求字符串匹配度最高的location后，立即使用此location处理请求，而不再使用location块中的正则uri和请求字符串做匹配。

- “～”，用于表示uri包含正则表达式，并且区分大小写。

- “～*”，用于表示uri包含正则表达式，并且不区分大小写。注意如果uri包含正则表达式，就必须要使用“～”或者“～*”标识。

> 前缀匹配下，返回最长匹配的 location，与 location 所在位置顺序无关。

**规则的匹配优先级从高到低依次为：**

1. location =    # 精准匹配
2. location ^~   # 带参前缀匹配
3. location ~    # 正则匹配（区分大小写）
4. location ~*   # 正则匹配（不区分大小写）
5. location /a   # 普通前缀匹配，优先级低于带参数前缀匹配。
6. location /    # 任何没有匹配成功的，都会匹配这里处理

最后推荐一个常用的nginx配置生成的网站：[DigitalOcean](https://www.digitalocean.com/community/tools/nginx?global.app.lang=zhCN)