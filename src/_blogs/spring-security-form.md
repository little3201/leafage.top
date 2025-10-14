---
title: "Spring security 学习和踩坑总结（表单）"
excerpt: "formLogin 登录就是表单登录，对于未认证的请求进行拦截，跳转到登录页，处理完登录请求之后，如果成功则会redirect到请求拦截之前的路径"
date: "2021-04-28T13:18:44Z"
seo:
  tags: [
    "spring",
    "security",
    "form",
    "java"
  ]
---

在[上一篇](blogs/spring-security)中，介绍了Spring Security的默认配置。本篇继续来了解如何进行定制配置。Spring Security 默认的配置是 formLogin 和 httpBasic 两种模式，

# FormLogin分析：

formLogin 登录就是表单登录，对于未认证的请求进行拦截，跳转到登录页，处理完登录请求之后，如果成功则会redirect到请求拦截之前的路径，例如（这里默认端口为80）请求http://localhost/user 如果没有登录，则会被拦截跳转到login页面，输入用户名密码，点击登录，成功后会redirect到http://localhost/user 路径的结果，如果直接访问的是http://localhost/login 则成功后会跳转到http://localhost 登录如果失败了，则会跳转到 http://localhost/login?error 的路径，而要是推出登录，请求的是http://localhost/login?logout 的路径。

httpBasic 登录是在请求header中加入认证信息，且每次请求都需要携带一个请求头为WWW-Authenticate的数据，示例为：WWW-Authenticate: Basic realm="Realm"，Spring security oauth2 的用户名密码登录模式中的client\_id和client\_secret也是通过这种方式来传递给后端接口的，关于oauth2后面在做介绍，httpBasic默认的登录处理路径也是login；

默认的realm参数为Realm，查看源码可知：

![](https://static.oschina.net/uploads/img/202104/14103801_WUSj.png)![](https://static.oschina.net/uploads/img/202104/14103801_59Rw.png)

            这里有一个疑问，默认配置的是formLogin和httpBasic，而且都是http://localhos/login 那为什么浏览器访问的时候，默认是formLogin而不是httpBasic呢？

来看一下WebSecurityConfigurerAdapter的配置：

![](https://static.oschina.net/uploads/img/202104/14103801_xvHW.png)![](https://static.oschina.net/uploads/img/202104/14103801_LStN.png)

第二张图片是HttpSecurity getHttp()方法中的代码实现，从代码可以看出，图一中虽然是启用的formLogin和httpBasic两种模式的登录，但是默认的apply了DefaultLoginPageConfigurer类中的配置；

## 配置了解：

DefaultLoginPageConfigurer类中的代码很简单，声明了两个属性，loginPageGeneratingFilter和logoutPageGeneratingFilter，只有两个方法，覆写的init(H http)和configure(H http)，H extends HttpSecurityBuilder。init(H http)配置了默认的login和logout的过滤器，并配置了csrf的相关配置，config(H http)配置了ExceptionHandlingConfigurer，并且添加默认的login和logout过滤器到http过滤器链中，代码如下：

![](https://static.oschina.net/uploads/img/202104/14103801_KzHF.png)

_注：图中报错代码是因为我项目是spring cloud gateway, 用的是webflux，所以HttpServletRequest没有。_

看到过很多文章在使用security的时候都是直接把csrf配置禁用，而且有的文章中说，为了跨域使用csrf().disable()，这个我就很难理解，csrf为了防止跨站请求攻击，和跨域有毛线关系，跨域配置是cors()。

上面说到config(H)方法中，配置了ExceptionHandlingConfigurer，根据类名可想而知，这个是处理登录失败的逻辑的，通过看代码可以看到这个类中定义了访问被拒绝的处理方法和一些操作，代码如下：

![](https://static.oschina.net/uploads/img/202104/14103802_COts.png)

其中config(H)方法覆写了SecurityConfigurerAdapter中的config(H)方法，该方法把获取到的accessDeniedHandler处理器添加了一个ExceptionTranslationFilter过滤器，并将这个过滤器给了过滤器链。

回过头来再看DefaultLoginPageGenerationFilter和DefaultLogoutPageGenerationFilter这两个过滤器都做了哪些事情。DefaultLoginPageGenerationFilter继承抽象类GenericFilterBean，GenericFilterBean实现了Filter接口，DefaultLoginPageGenerationFilter的作用就是用户没有配置登录页的时候给一个默认配置。同样的DefaultLogoutPageGenerationFilter也是一样的，具体的内容在上一篇[spring security 学习和踩坑总结（入门）](https://www.leafage.top/blogs/detail/208291JMJ)中大概介绍过了，详细信息查看上一篇文章。