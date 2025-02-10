---
title: "SQL 字符串分割，转换为列"
excerpt: "某系统数据库中，存储关联数据不是通过关联表，而是通过存储关联数据的某个唯一标识符号，且一对多的时候，使用逗号或者其他符号分隔，但是查询的时候需要此字段作为条件进行过滤，那就需要将这个字段的值转换为多个记录行的形式"
date: "2021-04-10T03:33:22Z"
ogImage:
  url: "/assets/blogs/cover.jpg"
tags: [
  "sql",
  "split"
]
---

### SQL 字符串分割，转换为列

某系统数据库中，存储关联数据不是通过关联表，而是通过存储关联数据的某个唯一标识符号，且一对多的时候，使用逗号或者其他符号分隔，例如"1,2,36"这样的格式，但是查询的时候需要此字段作为条件进行过滤，那就需要将这个字段的值转换为多个记录行的形式，那怎么来做呢？

首先，要实现这样的功能，需要借助mysql默认提供的一张表来辅助完成，这个表的名字是：help\_topic，另外需要借助一些mysql提供的函数：length(str)，substring\_index(str, ‘分隔符’, {第几个分隔符})，replace(str, ‘要被替换的’ , ‘替换后的’) 来进行；

具体的操作如下示例，后面在进行详细的说明：

1.  先执行基础查询，看看数据存储的格式：

```sql
select role_ids from t_user where id = 3;
```

执行结果如下：  
![分割处理前](https://static.oschina.net/uploads/img/202012/21134936_ZOFc.png)  
2\. 再来执行将该字段的值转换成多个记录行的语句：

```sql
SELECT
 SUBSTRING_INDEX( SUBSTRING_INDEX( u.role_ids, ',', ht.help_topic_id + 1 ), ',', -1 ) AS roleId 
FROM
 t_user u
 INNER JOIN mysql.help_topic ht ON ht.help_topic_id < ( LENGTH( role_ids ) - LENGTH( REPLACE ( role_ids, ',', '' )) + 1 ) 
WHERE
 id = 3;
```

执行结果如下：  
![分割后](https://static.oschina.net/uploads/img/202012/21134936_g2Ft.png)