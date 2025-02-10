---
title: "Dockerfile 指令学习总结"
excerpt: "Dockerfile 描述了组装镜像的步骤，其中每条指令都是单独执行的。除了FROM指令，其他每一条指令都会在上一条指令所生成镜像的基础上执行，执行完后会生成一个新的镜像层，新的镜像层覆盖在原来的镜像之上从而形成了新的镜像"
date: "2022-01-25T08:22:22Z"
ogImage:
  url: "/assets/blogs/cover.jpg"
tags: [
  "file",
  "upload",
  "typescript",
  "qiniu-js"
]
---

Dockerfile 描述了组装镜像的步骤，其中每条指令都是单独执行的。除了FROM指令，其他每一条指令都会在上一条指令所生成镜像的基础上执行，执行完后会生成一个新的镜像层，新的镜像层覆盖在原来的镜像之上从而形成了新的镜像。Dockerfile所生成的最终镜像就是在基础镜像上面叠加一层层的镜像层组件的。Dockerfile 分为四部分：基础镜像信息、维护者信息、镜像操作指令和容器启动时执行指令。

Dockerfile 中指令不区分大小写，以 “#” 开头的是注释行，而在其他位置出现的 “#” 会被当成参数。

#### 基础示例：

```dockerfile
# 基础镜像
FROM openjdk:8-jdk-alpine AS openjdk8
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 镜像操作指令
RUN echo "JAVA_HOME"
# 容器启动时执行的指令
CMD ["java -version"]
```
**基础镜像推荐使用alpine版本的，这个会使得基础镜像很轻**

非alpine版本的镜像：

![image.png](https://static.oschina.net/uploads/img/202101/03104308_v1le.jpg)  

alpine版本的镜像：

![image.png](https://static.oschina.net/uploads/img/202101/03104309_pYZA.jpg)  

执行`docker build .`来构建镜像

#### 执行结果：

![image.png](https://static.oschina.net/uploads/img/202101/03104309_GkEt.jpg)

#### 示例执行结果说明：

通过执行结果可以看到，第一次构建，没有基础镜像openjdk:8-jdk-alpine，自动去docker hub上拉取镜像。

1.  <font color=red>红色框：</font>
    docker在上一条命令构建的基础镜像之上运行一个临时容器，然后执行每一条指令，指令会对临时容器进行修改，将修改后的临时容器提交一个作为下一条命令执行的新的镜像层，然后将临时容器删除。

2.  <font color=deepskyblue>蓝色框：</font>
    蓝色框中有一行显示"JAVA_HOME"，这个是Dockerfile中`RUN`指令再构建镜像时执行的。

## FROM指令：

```dockerfile
FROM <image> [AS <name>]
FROM <image>[:<tag>] [AS <name>]
FROM <image>[@<digest>] [AS <name>]
```

> `FROM`是一个镜像构建开始的第一条指令，而非必须是Dockerfile文件的第一行非注释指令。

#### 使用说明：

1.  `FROM`之前可以有其他指令，这个指令就是`ARG`，并且是唯一一个可声明在`FROM`之前的指令，声明在`FROM`之前的`ARG`指令，因为在构建之外，所以不能在`FROM`之后的任何地方使用，在`FROM`指令前声明的`ARG`指令需要指定默认值，在构建体中使用`ARG`指令可以不用指定默认值；

2.  若`FROM`指令中的参数`<tag>`或`<digest>`为空，则默认为latest，如果`<image>`或`<tag>`指定的镜像不存在，则返回错误。

#### 构建示例：

```dockerfile
ARG VERSION=8-jdk-alpine
# 基础镜像
FROM openjdk:$VERSION
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 镜像操作指令
RUN echo "JAVA_HOME"
# 容器启动时执行的指令
CMD ["java -version"]
```

#### 执行结果：

![image.png](https://static.oschina.net/uploads/img/202101/03104309_yeoh.jpg)

#### 示例执行结果说明：

1.  Step 1/5 显示结果可以看到指定了VERSION，且在`FROM`指令执行时，直接使用了ARG指令创建的变量；
2.  与上面执行结果不同的是，`FROM`后面没有Pull 相关的信息，因为之前同版本的jdk镜像已经在本地镜像库中存在，docker会直接复用，而不是在重新拉去。

构建完成之后，执行`doker images` 命令查看镜像信息；
![image.png](https://static.oschina.net/uploads/img/202101/03104309_sxXF.jpg)从结果中可以看到，openjdk的镜像只有一个，且版本号是8-jdk-alpine，关于新创建的镜像没有REPOSITORY和TAG后面再做说明；

### FROM多阶段构建：

在17.05版本之前的Docker，只允许Dockerfile中出现一个`FROM`指令，但在此之后，可以在一个Dockerfile中出现多个`FROM`用来实现多阶段构建。

#### 使用说明：

每一条 `FROM` 指令都是一个构建阶段，多条 `FROM` 就是多阶段构建，虽然最后生成的镜像只能是最后一个阶段的结果，但是，能够将前置阶段中的文件拷贝到后边的阶段中，这就是多阶段构建的最大意义。

#### 构建示例：

```dockerfile
# 第一阶段构建，设置基础镜像，并设置别名在其他构建阶段可以直接使用
FROM maven:3-jdk-8-alpine AS maven-latest
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 设置工作空间，后续命令会在此目录下执行
WORKDIR /app
# 添加文件到容器中
ADD . /app/
# 执行打包命令
RUN mvn clean package

# 第二阶段构建，以第一阶段构建为基础，再次进行构建步骤
FROM openjdk:8-jdk-alpine
# 从第一阶段复制结果
# 如果要用的阶段没有设置别名，那么要使用--from=n，n表示从0开始的标记位
COPY --from=maven-latest /target/demo.jar .
# 容器启动时执行的指令
ENTRYPOINT ["/bin/sh", "-c", "java -jar /demo.jar"]
```

执行`docker build .`之后，执行构建。

#### 执行结果：

![image.png](https://static.oschina.net/uploads/img/202101/03104309_jcuj.jpg)

#### 示例执行结果说明：

1.  第一阶段以maven为基础镜像进行源代码的打包，第二阶段依托第一阶段的打包后的镜像进行构建；
2.  在构建完成之后，查看镜像信息，有除了基础镜像之外有两个镜像，一个是第一阶段构建的，一个是第二阶段构建的。
3.  通过 `docker history <image id>` 可以看到构建信息（小提示：镜像操作使用镜像ID的前4位即可）：
    ![image.png](https://static.oschina.net/uploads/img/202101/03104309_uWd1.jpg)

**疑问： 为什么第一阶段构建的镜像比第二阶段构建的镜像大？**

**解释：** 第一阶段构建镜像大，因为执行的`mvn clean package` 命令，会去下载项目所有的依赖jar，由于没有进行任何的删除操作，所有文件都会被保留在镜像中，这也就是在写Dockerfile需要注意的，在编写Dockerfile时候，要特别注意所有的操作不能有多余的文件或者依赖被加入，否则构建的镜像文件会比较大。

第一阶段构建镜像小，因为多阶段构建的核心命令是 `FROM`。在多阶段构建中，每次 `FROM` 都会开启一个新的 Stage（阶段），可以看作一个新的 Image（不够准确、来源请求），与其它阶段隔离（甚至包括环境变量）。只有最后的 `FROM` 才会被纳入 Image 中。

## RUN指令：

```dockerfile
shell 格式：RUN <command> (/bin/sh -c /S /C)
exec 格式：RUN ["executable", "param1", "param2"]
```

`RUN`指令将会在前一条命令创建出的镜像的基础之上创建一个容器，并在容器中运行命令，在命令结束运行后提交容器为新镜像，新镜像将被Dockerfile中的下一条指令使用。

#### 使用说明：

1.  使用exec格式时，命令是直接运行的，exec格式中的参数会作为JSON数组被Docker解析，所以在使用exec格式命令时，参数必须使用双引号不能单引号；
2.  使用shell格式时，命令通过 `/bin/sh -c` 运行，可以使用反斜杠（\\）将单个`RUN`指令继续到下一行。
3.  `RUN`指令将执行所有合法命令并提交执行结果，`RUN`指令创建的中间镜像会被缓存，并会在下次构建中使用。如果不想使用这些缓存镜像，可以在构建时指定 `--no-cache` 参数，如：`docker build --no-cache`。

#### 构建示例：

```dockerfile
# 基础镜像
FROM openjdk:8-jdk-alpine AS openjdk8
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 镜像操作指令
RUN echo "$JAVA_HOME"
```

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104309_SZdw.jpg)
从打印的日志中可以看到RUN执行了JAVA_HOME的路径打印，我们再看下镜像中的信息：![image.png](https://static.oschina.net/uploads/img/202101/03104309_CIPp.jpg)

## CMD指令：

```dockerfile
exec格式（推荐）：CMD ["executable","param1","param2"]
entrypoint格式：CMD ["param1","param2"] 
shell格式：CMD command param1 param2
```

Docker 不是虚拟机，容器就是进程。既然是进程，那么在启动容器的时候，需要指定所运行的程序及参数。`CMD` 指令就是用于指定默认的容器主进程的启动命令的。它的主要目的是为执行中的容器提供默认值。

使用说明：

1.  shell格式和exec格式使用时，命令在容器中的运行方式和RUN一样，其规则同样适用；
2.  每个 Dockerfile 只会执行一条`CMD`指令，如果Dockerfile中存在多条`CMD`指令命令，只有最后一条会被执行；
3.  如果用户启动容器时候指定了运行的命令，则会覆盖掉`CMD`指定的命令。
4.  entrypoint格式是在CMD指令和`ENTRYPOINT`指令配合时使用的，`CMD`指令中的参数会被添加到`ENTRYPOINT`指令中；
5.  如果使用`CMD`为`ENTRYPOINT`指令提供默认参数，`CMD`和`ENTRYPOINT`指令都应以JSON数组格式指定；

#### 构建示例：

```dockerfile
# 基础镜像
FROM openjdk:8-jdk-alpine
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 镜像操作指令
CMD ["echo", "$JAVA_HOME"]
```

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104310_eTI0.jpg)
可以从结果看到`CMD ["echo"，"\$JAVA_HOME"]`不会在$JAVA_HOME上进行可变替换。如果想要shell处理，使用shell形式或直接执行一个shell，例如：`CMD ["sh","-c","echo JAVA_HOME"]`

## LABEL指令：

```dockerfile
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```

#### 使用说明：

1.  LABEL指令以key=value方式给镜像添加元数据，要在`LABEL`值中包含空格，请使用引号和反斜杠，就像在命令行解析中一样；
2.  基础镜像、父镜像中包含的标签会被继承，如果镜像中标签已经存在但具有不同的值，则后面设置的值会覆盖先前设置的值；
3.  一个镜像中可以有多个标签。您可以在一行上指定多个标签。

#### 构建示例：

```dockerfile
# 基础镜像
FROM openjdk:8-jdk-alpine AS openjdk8
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# 多标签：标记版本号及描述信息，
LABEL version="1.0" description="This text illustrates \
that label-values can span multiple lines."
```

使用`docker inspect`命令查看image的labels

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104310_ETqG.jpg)  
每个`LABEL`指令产生一个新层，如果使用许多标签，可能会导致效率低下。如果Docker遇到已经存在的label/key，则新值将覆盖具有相同键的任何先前标签。

## EXPOSE指令：

```dockerfile
EXPOSE <port> [<port>/<protocol>...]
```

`EXPOSE`指令通知Docker容器在运行时监听指定的网络端口，可以指定端口是侦听TCP还是UDP，如果未指定协议，则默认值为TCP。

#### 使用说明：

1.  无论`EXPOSE`设置如何，都可以在运行时使用`-p`参数覆盖它们，例如：docker run -p 8080:80；
2.  `EXPOSE` 指令是声明运行时容器提供服务端口，这只是一个声明，在运行时并不会因为这个声明应用就会对外暴露这个端口，只有在`docker run` 时显示指定 -p \[外部端口\]:\[容器端口\]，才会对外暴露。

在 Dockerfile 中使用EXPOSE声明端口有两个好处：

1.  帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；
2.  在运行时使用随机端口映射时，也就是 `docker run -P` 时，会自动随机映射 `EXPOSE` 的端口。

## ENV指令：

```dockerfile
设置一个：ENV <key> <value>
设置多个：ENV <key>=<value> <key1>=<value1> ...
```

`ENV`指令将镜像运行时环境变量`<key>`设置为`<value>`。此值将在构建阶段中所有后续指令的环境中使用，并且在许多情况下也可以内联替换。

可以通过命令：`docker run -e "key=value"`来覆盖Dockerfile中的设置项的值。

#### 使用说明：

1.  设置一个时，第一个空格后面的整个字符串将被视为`<value>` 包括空格和引号等字符；
2.  设置多个时，这种形式在语法中使用"="，与命令行解析一样，引号和反斜杠可用于在值内包含空格。

```dockerfile
FROM openjdk:8-jdk-alpine
# 维护者信息
LABEL maintainer="liwenqiang@tseveryday.com"
# Pointer a active profile
ENV JAR=demo VERSION=0.0.1-RELEASE
# Run the jar file
ENTRYPOINT ["/bin/sh", "-c", "java -jar /target/${JAR}-${VERSION}.jar"]
```

#### 执行结果：

通过docker inspect 查看镜像信息：=![image.png](https://static.oschina.net/uploads/img/202101/03104310_OQ7R.jpg)

## ADD指令：

```dockerfile
ADD [--chown=<user>:<group>] <src>... <dest>
ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]
```

注：–chown 仅在用于在Linux上构建容器时的Dockerfile上可用，在Windows容器上不起作用

`ADD`指令是有上下文的（默认为当前Dockerfile所在目录），从Dockerfile文件相对的`<src>`路径下复制其下的文件/文件夹到Docker镜像的工作目录下的相对的`<dest>`目录。

例如：linux的/home/user/src下执行Dockerfile构建镜像，要添加/home/user/src/demo文件夹所有内容到docker镜像的/app工作目录下，需要设置`ADD . /app/` 。

`<src>`也可以为远程文件URL，当`<src>`是远程文件URL的情况下，目标将具有600的权限。如果正在检索的远程文件具有HTTP Last-Modified 的标头，则来自该标头的时间戳将用于设置目的地上的mtime文件，另外像在`ADD`期间处理的任何其它文件一样，mtime将不包括在确定文件是否已经改变并且高速缓存应该被更新。

#### 规则：

-   `<src>`路径必须在构建的上下文中，不能`ADD ../something /target`，因为docker构建的第一步是发送上下文目录（和子目录）到docker守护进程。
-   如果`<src>`是URL并且`<dest>`不以尾部斜杠结尾，则从URL下载文件并将其复制到`<dest>`。
-   如果`<src>`是URL并且`<dest>`以尾部斜杠结尾，则从URL中推断文件名，并将文件下载到`<dest>/<filename>`。例如，`ADD http://example.com/foobar /`会创建文件/foobar。网址必须有一个非平凡的路径，以便在这种情况下可以发现一个适当的文件名（http://example.com不会工作）。

#### 使用说明：

1.  `<src>`资源可以指定多个，但如果指定的是文件或目录，会被解析为基于镜像上下文的相对路径。
2.  如果`<src>`是目录，则复制目录的整个内容，包括文件系统元数据。
3.  如果URL文件使用身份验证保护，则需要使用`RUN wget`，`RUN curl`或从容器内使用其他工具，因为`ADD`指令不支持身份验证。
4.  在Dockerfile构建镜像时使用`docker build - <somefile`构建，这时没有构建上下文，所以Dockerfile只能包含一个基于URL的`ADD`指令。
5.  可以通过命令传递压缩归档文件：`docker build - <archive.tar.gz`，归档根目录下的Dockerfile和归档的其余部分将在构建的上下文中使用。
6.  如果`<src>`是识别的压缩格式（identity，gzip，bzip2或xz）的本地tar存档，则将其解包为目录（识别是基于文件内容的而不是文件名，例如文件名是demo.tar.gz，但是文件是空的，就不会去解压）。来自远程URL的资源不会解压缩。
7.  如果直接或由于使用通配符指定了多个`<src>`资源，则`<dest>`必须是目录，并且必须以斜杠/结尾。
8.  如果`<dest>`不以尾部斜杠结尾，它将被视为常规文件，`<src>`的内容将写在`<dest>`。
9.  如果`<dest>`不存在，则会与其路径中的所有缺少的目录一起创建。

#### 构建示例：

```dockerfile
# 设置基础镜像
FROM openjdk:8-jdk-alpine
# 复制jar包到镜像中
ADD https://oss.abeille.top/demo-0.0.1-SNAPSHOT.jar .
# 容器启动时执行的指令
ENTRYPOINT ["/bin/sh", "-c", "java -jar demo-0.0.1-SNAPSHOT.jar"]
```

#### 执行结果：

![image.png](https://static.oschina.net/uploads/img/202101/03104310_L3Ty.jpg)通过结果可以看到，镜像在构建过程中会把远程地址的文件下载并写入镜像的上下文的根目录 . 中，构建完成之后启动镜像验证结果，结果打印了正常的服务日志，说明构建的镜像是可以使用的。

## COPY指令：

```dockerfile
COPY [--chown=<user>:<group>] <src>... <dest>
COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]
```

注：–chown仅在用于在Linux上构建容器时的Dockerfile上可用，在Windows容器上不起作用  
–chown标志指定给定的用户名，组名或UID / GID组合以请求对复制内容的特定所有权

`COPY` 指令复制`<src>`所指向的文件或目录，将它添加到新镜像中，复制的文件或目录在镜像中的路径是`<dest>`。`<src>`所指定的源可以有多个，但必须在上下文中，即必须是上下文根目录的相对路径。

#### 使用说明：

1.  `<src>`可以使用通配符指向所有匹配通配符的文件或目录；
2.  `<dest>`可以是文件或目录，但是必须是目标镜像中的绝对路径或者相对于WORKDIR 的相对路径；
3.  若`<src>`或`<dest>`以斜杠/结尾，则其指向的是目录，否则指向文件。
4.  若`<dest>`是一个文件，则`<src>`的内容会被写入到`<dest>`中，否则`<src>`所指向的文件或目录中的内容会被复制添加到`<dest>`目录中。
5.  当`<src>`指定多个源时，`<dest>`必须是目录，如果`<dest>`不存在，则会被创建。

#### 构建示例：

```dockerfile
# 设置基础镜像
FROM openjdk:8-jdk-alpine
# 复制jar包到镜像中
COPY /target/demo-0.0.1-SNAPSHOT.jar .
# 容器启动时执行的指令
ENTRYPOINT ["/bin/sh", "-c", "java -jar demo-0.0.1-SNAPSHOT.jar"]
```

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104310_N9qn.jpg)上图是执行结果可以看到，在指定的路径下文件不存在时，会打印异常信息，且构建过程会终止但是之前执行的步骤生成的镜像还是会在docker daemon缓存中存在。这是因为`<dest>`不是以斜杠结尾，所以就会把demo.jar 写入到`<dest>`，但是这个demo.jar又不存在，所以写入的时候发生异常。

修改示例为正确路径文件后，在执行构建，并运行镜像，就会打印服务启动的日志。![image.png](https://static.oschina.net/uploads/img/202101/03104310_DYtd.jpg)

## ENTRYPOINT指令：

```dockerfile
exec格式：ENTRYPOINT ["executable", "param1", "param2"]
shell格式：ENTRYPOINT command param1 param2
```

`ENTRYPOINT`指令和 `CMD` 相似，都可以让容器在每次启动时执行相同的命令，但是又有不同的地方，`CMD`可以是命令，也可以是参数，而`ENTRYPOINT`只能是命令。

#### 使用说明：

1.  在使用shell格式时，`ENTRYPOINT`指令会忽略所有的`CMD`指令和docker run 命令的参数，并且会运行在 /bin/sh -c 中，这就说明`ENTRYPOINT`指令进程为 /bin/sh -c 的子进程，进程在容器中的PID不是1，且不接受Unix信号，即在使用docker stop 命令时，命令进程接收不到SIGTERM信号；
2.  `ENTRYPOINT` 在运行时也可以替代，不过比 CMD 要略显繁琐，需要通过 `docker run --entrypoint`来指定；
3.  当指定了 `ENTRYPOINT` 后，`CMD` 的含义就发生了改变，不再是直接的运行其命令，而是将 `CMD` 的内容作为参数传给 `ENTRYPOINT` 指令；
4.  在一个Dockerfile 中可以有多条`ENTRYPOINT`指令，但是只有最后一条有效；
5.  使用exec格式时，`docker run` 传入的命令会覆盖CMD指令的内容并且附加到`ENTRYPOINT`指令的参数中，而不会覆盖`ENTRYPOINT`指令的参数。

#### 构建示例：

```dockerfile
FROM openjdk:8-jdk-alpine
# 复制jar包到镜像中
ADD /target/demo-0.0.1-SNAPSHOT.jar .
# 容器启动时执行的指令
ENTRYPOINT ["/bin/sh", "-c", "java -jar demo-0.1.0-SNAPSHOT.jar"]
ENTRYPOINT ["/bin/sh", "-c", "java -jar demo-0.0.1-SNAPSHOT.jar"]
```

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104311_NbWg.jpg)通过构建过成可以看到，在构建时，并不会执行`ENTRYPOINT`的命令，当我们启动镜像时才会执行其中的ENTRYPOINT，虽然设置了两个`ENTRYPOINT`指令，但是只执行了`java -jar demo-0.0.1-SNAPSHOT.jar`命令来启动服务，因为 demo-0.1.0-SNAPSHOT.jar 这个并不存在，如果会执行第一个`ENTRYPOINT`的话，启动一个不存在的jar肯定是会发生异常。这也印证了使用说明中的第4条。

## VOLUME指令：

```dockerfile
VOLUME ["/data"]
```

`VOLUME`指令创建具有指定名称的挂载点，并将其标记为从本机主机或其他容器保留外部挂载的卷。该值可以是JSON数组VOLUME \["/var/log/"\]或具有多个参数的纯字符串。为了防止运行时用户忘记将动态文件所保存目录挂载为卷，在 Dockerfile 中，我们可以事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据。

#### 使用说明：

1.  基于Windows的容器上的卷：使用基于Windows的容器时，容器内的卷的目表地址必须是不存在或空目录，并且不能是 C 盘下的目录。
2.  主机目录是在容器运行时声明的：主机目录（挂载点）从本质上说是依赖于主机的。这是为了保留镜像的可移植性，因为不能保证给定的主机目录在所有主机上都可用。因此，无法从Dockerfile内挂载主机目录。该`VOLUME`指令不支持指定host-dir 参数。创建或运行容器时，必须指定安装点。

#### 构建示例：

```dockerfile
FROM openjdk:8-jdk-alpine
VOLUME /data
```

#### 示例执行结果说明：

#### 疑问：

Dockerfile 中有一个 `VOLUME` 命令，可以把挂载一个目录到主机目录，但是在主机目录下的名字是随机的，除非用户用 -v 指定，但是如果在 Dockerfile 中不用 `VOLUME`，只在运行时用 -v 指定也能达到效果，那么就有一个问题，`VOLUME` 在 Dockerfile 中到底有多少用，在 Host 下创建了几个用户一般找不到的文件到底有多少使用价值，大部分情况下用户都是要手动使用 -v 重新指定挂载目录，那 `VOLUME` 命令就显得很鸡肋。

#### 解释：

可以把`VOLUME`理解为，从镜像中复制指定卷的文件夹到本地 /var/lib/docker/volumes/xxxxxxxxx/ 文件夹，然后把本地的该文件夹挂载到容器里面去。

因为VOLUME实际上就是在本地新建了一个文件夹挂载了，那么实际上容器内部的文件夹有三种情况：

1.  没有指定`VOLUME`也没有指定`-v`，这种是普通文件夹。
2.  指定了`VOLUME`没有指定`-v`，这种文件夹可以在不同容器之间共享，但是无法在本地修改。
3.  指定了`-v`的文件夹，这种文件夹可以在不同容器之间共享，且可以在本地修改。

## USER指令：

```dockerfile
USER <user>[:<group>]
USER <UID>[:<GID>]
```

指定运行容器时的用户名或 UID，后续的 `RUN` 也会使用指定用户。当服务不需要管理员权限时，可以通过该命令指定运行用户。并且可以在之前创建所需要的用户。

#### 使用说明：

1.  在Windows上，如果不是内置帐户，则必须首先创建用户。这可以通过`net user`作为Dockerfile的一部分调用的命令来完成。
2.  当用户没有主要组时，镜像（或后续说明）将与该root组一起运行。

#### 构建示例：

```dockerfile
RUN groupadd -r dev && useradd -r -g dev dev
USER dev
RUN [ "systemctl start elasticsearch" ]
```

## WORKDIR指令：

```dockerfile
WORKDIR /path/to/workdir
```

为后续的 `RUN`、`CMD`、`ENTRYPOINT` 指令配置工作目录，在`WORKDIR`指令之前执行的指令，由于没有设置`WORKDIR`，它默认为当前镜像构建的上下文根目录，所以会基于根目录执行。

#### 使用说明：

1.  `WORKDIR`指令可以解析先前使用ENV设置的环境变量。您只能使用在Dockerfile中显式设置的环境变量；
2.  可以使用多个 `WORKDIR` 指令，后续命令如果参数是相对路径，则会基于之前命令指定的路径。

#### 构建示例：

```dockerfile
FROM openjdk:8-jdk-alpine
WORKDIR /everyday
WORKDIR chain
RUN pwd
```

#### 示例执行结果说明：

![image.png](https://static.oschina.net/uploads/img/202101/03104311_ea1H.jpg)

## ARG指令：

```dockerfile
ARG <name>[=<default value>]
```

构建参数和 `ENV` 的效果一样，都是设置环境变量。所不同的是，`ARG` 所设置的构建环境的环境变量，在将来容器运行时是不会存在这些环境变量的。通过 `docker history` 可以看到所有设置的值。

#### 使用说明：

1.  不使用build-time变量来传递诸如github密钥，用户凭证等密码。构建时变量值使用docker history命令对图像的任何用户可见；
2.  ARG 指令定义参数的默认值可以在 `docker build` 中用 `--build-arg <key>=<value>` 来覆盖；
3.  在 1.13 之前的版本，要求 `--build-arg` 中的参数名，必须在 Dockerfile 中用 `ARG` 定义过了，就是 `--build-arg` 指定的参数，必须在Dockerfile 中使用了。如果对应参数没有被使用，则会报错退出构建。从 1.13 开始，这种严格的限制被放开，不再报错退出，而是显示警告信息，并继续构建。

#### 构建示例：

```dockerfile
ARG VERSION=8-jdk-alpine
# 基础镜像
FROM openjdk:$VERSION
ARG VERSION
RUN echo $VERSION > java_version
```

## ONBUILD指令：

```dockerfile
ONBUILD [INSTRUCTION]
```

`ONBUILD` 是一个特殊的指令，它的功能时添加一个将来执行的触发器指令到镜像中，它后面跟的是其它指令，比如 `RUN`, `COPY` 等，而这些指令，在当前镜像构建时并不会被执行，当该镜像作为`FROM`指令的参数时， 这些触发器指令就会在`FROM`指令执行时加入到构建中。当需要构建一个基础镜像时，`ONBUILD`是很有用的。

#### ONBUILD指令具体执行步骤：

1.  在构建过程中，ONBUILD指令会添加到触发器指令镜像的云数据中，这些触发器不会再当前构建中执行；
2.  在构建过程最后，触发器指令会被存储在镜像详情中，其主键是OnBuild，可以使用docker inspect命令查看；
3.  构建完成后，该镜像可能作为其他Dockerfile中的`FROM`指令的参数，在构建时`FROM`指令会寻找`ONBUILD`触发器指令，并且会以它们注册的顺序执行。如果有触发器执行失败，则`FROM`指令被中止，并返回失败；如果所有的触发器执行成功，则`FROM`会执行下面的命令。在镜像构建完成后，触发器会被清除，不会被子孙镜像继承。

#### 使用说明：

1.  `ONBUILD`指令中不能包含 `ONBUILD`指令，并且不会触发`FROM`指令；
2.  使用`ONBUILD`指令的Dockerfile构建的镜像应该有特殊的标签，例如：demo:1.1.0-onbuild，这样做的好处是提示开发人员要在使用时注意；
3.  在`ONBUILD`指令中添加`ADD`和`COPY`指令时要特别注意，假如新构建过程的被添加的资源缺失了，会导致构建失败；