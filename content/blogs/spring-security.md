---
title: "Spring security 学习和踩坑总结（入门）"
excerpt: "Java Web项目的权限管理框架，目前有两个比较成熟且使用较多的框架，Shiro 和 Spring Security ，Shiro 比 Spring Security更加轻量级，但是需要手动配置的东西较多，Spring Security 和 Spring 集成更好，甚至直接适配了Spring Boot"
date: "2021-04-10T03:32:35Z"
seo:
  tags: [
    "Spring",
    "Security",
    "Form",
    "Java"
  ]
---

Java Web项目的权限管理框架，目前有两个比较成熟且使用较多的框架，Shiro 和 Spring Security ，Shiro 比 Spring Security更加轻量级，但是需要手动配置的东西较多，Spring Security 和 Spring 集成更好，甚至直接适配了Spring Boot。

### 一、最简单的使用：

**1.1、配置及使用**

要使用Spring Security 首先要引入依赖，Spring-boot 已经有了集成，直接引入spring-boot-statr-security依赖包即可：

```xml
<!-- spring security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

演示项目使用的是Spring boot 2.1.5版本，所以加入依赖后，会自动获取Spring Security 5.1.5版本的Jar包：

然后，就没有然后了，一个基本的Spring Security已经有了，然后打开浏览器，访问http://localhost:8080 ，神奇的出来了一个登录页面，但是并没有创建任何的html文件，resouces文件夹下除了两个配置文件，别的什么都没有了;

![](https://static.oschina.net/uploads/img/202012/21135109_7knb.jpg)![](https://static.oschina.net/uploads/img/202012/21135110_Zkot.jpg)

Spring Security已经默认做了一些配置，并且创建一个简单的登录页面，那这个页面事怎么来的？通过查看相关文档和源码来一探究竟。

那什么都没有配置，从哪开始开始看呢？

**1.2 、分析原理**

1.2.1、登录页面：

一般不知从何入手，就看官方文档里是如何做的，官方的文档和api 是最好最完整的介绍和参考，点击链接查看官方文档地址([https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#jc-oauth2login](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#jc-oauth2login))，或者通过Google 搜索 spring security，在结果中点击Spring Security Reference，点击进入页面，然后就可以看到关于Spring Security的文档；

通过查看文档发现，WebSecurityConfigurerAdapter 提供的默认的配置，那就来看看这个抽象类，在这个抽象类中，又一个方法配置了formLogin()，这个方法内容如下：

![](https://static.oschina.net/uploads/img/202012/21135110_HPMv.jpg)

查看formLogin()源码，跳转到HttpSecurity类中，这个方法返回一个FormLoginConfigurer<HttpSercurity\>类型的数据。再继续来看看这个FormLoginConfigurer，在FormLoginConfigurer中有个initDefaultLoginFilter()方法：

![](https://static.oschina.net/uploads/img/202012/21135110_rO1g.jpg)

这个方法，初始化一个默认登录页的过滤器，可以看到第一句代码，默认的过滤器是DefaultLoginPageGeneratingFilter，下面是设置一些必要的参数，进入到这个过滤器中：

在描述中可以看到，如果没有配置login页，这个过滤器会被创建，然后看doFilter()方法：

![](https://static.oschina.net/uploads/img/202012/21135110_8NOp.jpg)

登录页面的配置是通过generateLoginPageHtml()方法创建的，再来看看这个方法内容：

```java
private String generateLoginPageHtml(HttpServletRequest request, boolean loginError, boolean logoutSuccess) {
  String errorMsg = "none";
        // ...

  if (formLoginEnabled) {
   sb.append("<h3>Login with Username and Password</h3>");
   sb.append("<form name='f' action='").append(request.getContextPath())
     .append(authenticationUrl).append("' method='POST'>\n");
   sb.append("<table>\n");
   sb.append(" <tr><td>User:</td><td><input type='text' name='");
   sb.append(usernameParameter).append("' value='").append("'></td></tr>\n");
   sb.append(" <tr><td>Password:</td><td><input type='password' name='")
     .append(passwordParameter).append("'/></td></tr>\n");

   if (rememberMeParameter != null) {
    sb.append(" <tr><td><input type='checkbox' name='")
      .append(rememberMeParameter)
      .append("'/></td><td>Remember me on this computer.</td></tr>\n");
   }
   sb.append(" <tr><td colspan='2'><input name=\"submit\" type=\"submit\" value=\"Login\"/></td></tr>\n");
   renderHiddenInputs(sb, request);
   sb.append("</table>\n");
   sb.append("</form>");
  }

  // ...
 }
```

至此，默认登录页及配置，已经可以清楚了。

1.2.2、登录用户及密码：

在项目启动的日志中，可以发现有这样一条信息：

![](https://static.oschina.net/uploads/img/202012/21135110_MJtR.jpg)

可以看到，自动配置类是UserDetailsServiceAutoConfiguration，密码是cf73184c-e8f2-48d8-9ce3-4413e3943f19，现在知道了密码，那用户名是什么还不知道，进入到UserDetailsServiceAutoConfiguration中去看看。

在这个 UserDetailsServiceAutoConfiguration 类的描述中可以知道，这个类是设置一些 Spring Security 相关默认的自动配置，把InMemoryUserDetailsManager 中得user 和 password 信息设置为默认得用户和密码，可以通过提供的AuthenticationManager、AuthenticationProvider 或者 UserDetailsService 的 bean 来覆盖默认的自动配置信息。

![](https://static.oschina.net/uploads/img/202012/21135110_UJ47.jpg)

可以看到，日志中那句密码打印的是从图片中圈出来的这条语句打印的，在这个方法上面有一个inMemoryUserDetailsManager()方法，返回一个新的带有UserDetials信息参数构造的InMemoryUSerDetailsManager对象：

![](https://static.oschina.net/uploads/img/202012/21135110_XclD.jpg)

可以看到，第一个参数是User.withUsername(user.getName())，这个user.getName()的user 对象是上面SecurityProperties.User类型的，通过SecurityProperties 对象中获取的，首先看下SecurityProperties类：

![](https://static.oschina.net/uploads/img/202012/21135111_niIi.jpg)

通过配置文件中的，前缀为spring.security 的配置可以改变默认配置信息，再看看SecurityProperties 的 getUser()方法：

![](https://static.oschina.net/uploads/img/202012/21135111_ShIB.jpg)=>![](https://static.oschina.net/uploads/img/202012/21135111_90in.jpg)=>![](https://static.oschina.net/uploads/img/202012/21135111_39y8.jpg)

通过一步步的跟踪，发现默认的用户名是user。现在需要定义一个成功之后返回信息的Controller，并写一个方法：

```java
@Controller
public class IndexController {

  @RequestMapping("/")
  public String index() {
    return "/login";
  }
}
```

成功登录后，DispatcherServlet会将路由定位到“/”路径下，我们配置“/”再跳转到“/login”路径。

```java
@RequestMapping("/login")
@ResponseBody
public Boolean login() {
  return false;
}
```

去默认的登录页面尝试一下，输入用户名：user ，密码：（每次启动都会重新生成一个UUID的字符串），登录成功了，跳转到了RequestMapping("/")然后又跳转至RequestMapping("/login")，并返回结果，上面的提示信息说XML解析的问题，查了资料，在IE中是没有问题的，可以直接显示结果false，而谷歌显示XML类型的信息：

![](https://static.oschina.net/uploads/img/202012/21135111_aUPH.jpg)

1.3、修改默认配置的登录页和请求处理接口：

修改默认的Security配置需要继承WebSecurityConfigurerAdapter类，然后覆写config(HttpSecurity http)方法；

1.3.1、修改登录页：

定制自己开发的登录页的，只需要调用formLogin().loginPage("/customLogin")即可。

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http.formLogin().loginPage("/customLogin");
}
```

注意：loginPage配置会经过模板解析即TemplateResolver处理，所以能写.ftl或者.html后缀。

1.3.1、修改登录请求：

默认的处理接口为login，如果想修改也是可以的，通过formLogin().loginProcessingUrl("/singin")可配置。

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http.formLogin().loginProcessingUrl("/signin");
}
```

这里配置的接口需要自己实现其逻辑。