---
title: "Mybatis 批量操作 SQL 写法"
description: "mybatis 批量操作的SQL写法"
date: "2021-09-23T08:38:35Z"
seo:
  ogImage:
    url: "/assets/blogs/cover.jpg"
  tags: [
    "Mybatis",
    "Batch",
    "Insert",
    "Update"
  ]
---

### 在使用foreach时，collection属性值的三种情况：
- 如果传入的参数类型为List时，collection的默认属性值为list,同样可以使用@Param注解自定义keyName;
- 如果传入的参数类型为array时，collection的默认属性值为array,同样可以使用@Param注解自定义keyName;
- 如果传入的参数类型为Map时，collection的属性值可为三种情况：
1. 遍历map.keys;
2. 遍历map.values;
3. 遍历map.entrySet()

### 批量Insert，参数为List<Object\>

mysql的批量新增sql的写法示例，先看一下mapper的写法；

```java
void batchSaveUser(List<SysUser> userList);
```
接下来看sql如何写：

```sql
<insert id="batchSaveUser">
  insert into sys_user (ding_user_id, username, nickname, password, email, 
  mobile, avatar, creator_id, create_time, updator_id, update_time, is_delete)
  values
  <foreach collection="list" item="user" separator=",">
    (
    #{user.dingUserId}, #{user.username}, #{user.nickname}, #{user.password}, #{user.email},
    #{user.mobile}, #{user.avatar}, #{user.creatorId}, now(), #{user.updatorId}, now(), 0
    )
  </foreach>
</insert>
```
### 批量Insert，参数为Map<Long, List<Long\>>

```java
void batchSaveGroupAndUser(@Param("map") Map<Long, List<Long>> groupUserMap);
```
接下来看sql如何写：
```sql
<insert id="batchSaveGroupAndUser" parameterType="java.util.Map">
  insert into sys_group_member (group_id, user_id, creator_id, create_time)
  values
  <foreach collection="map.keys" item="groupId" separator=",">
    <foreach collection="map[groupId]" item="userId" separator=",">
      (
      #{groupId}, #{userId}, 'admin', now()
      )
    </foreach>
  </foreach>
</insert>
```
### 批量Insert，参数为Map<String, String>

```java
void batchInsert(@Param("map") Map<String, String> map);
```
```sql
<insert id="batchInsert" parameterType="java.util.Map">
  insert into brand_info (code, `name`, is_delete, create_time)
  values
  <foreach collection="map.entrySet()" index="key" item="value" open="(" close=")" separator=",">
      #{key}, #{value}, 0, now()
  </foreach>
</insert>
```
如果是只需要遍历key，写法则是collection="map.keys"

```sql
<insert id="batchSave" parameterType="java.util.Map">
  insert into brand_info (code, is_delete, create_time)
  values
  <foreach collection="map.keys" item="key" open="(" close=")" separator=",">
      #{key}, 0, now()
  </foreach>
</insert>
```
同理，如果是只需要遍历value，写法则是collection="map.values"

```sql
<insert id="batchSave" parameterType="java.util.Map">
  insert into brand_info (code, is_delete, create_time)
  values
  <foreach collection="map.values" item="value" open="(" close=")" separator=",">
      #{value}, 0, now()
  </foreach>
</insert>
```

### 批量Update，参数为List<Object\>
**注意：** 在执行批量Update的时候，数据库的url配置需要添加一项参数：&allowMultiQueries=true

如果没有这个配置参数的话，执行下面的更新语句会报错：

正确的sql写法如下：
```sql
<update id="batchUpdateCorporation" parameterType="java.util.List">
  <foreach collection="list" item="item" index="index" separator=";">
    update sys_corporation set
    <if test="item.name != null and item.name !=''">
        `name` = #{item.name},
    </if>
    <if test="item.code != null and item.code !=''">
        code = #{item.code},
    </if>
    <if test="item.parentCode != null and item.parentCode !=''">
        parent_code = #{item.parentCode},
    </if>
    updater = 'system',
    update_time = now()
    where id = #{item.id}
  </foreach>
</update>
```