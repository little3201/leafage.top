---
title: "一步步实现redis分布式锁"
excerpt: "当高并发场景下，会有多个请求同时获取到同样的数据，然后进行操作，实际上操作了多次，但是库存只减了一次"
date: "2021-02-02T08:28:43Z"
ogImage:
  url: "/assets/blogs/cover.jpg"
tags: [
  "java",
  "redis",
  "lock"
]
---

### 使用场景：
抢购活动，限量供应；

首先第一步设计：将库存信息放入redis进行缓存；
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods(){
        // 获取key对应的数据
        Integer stock = redisTemplate.opsForValue().get("stock");
        // 如果库存大于0，对库存减1
        if(null != stock && stock > 0){
            int realStock = stock - 1;
            // 将修改后的库存放入redis
            redisTemplate.opsForValue().set("stock", realStock);
            System.out.println("库存扣减成功，当前库存为：" + realStock);
        } else {
            System.out.println("库存扣减失败");
        }
    }
}
```

### 问题一：高并发场景下会出现库存扣减异常；
以上代码存在一个问题：当高并发场景下，会有多个请求同时获取到同样的数据，然后进行操作，实际上操作了多次，但是库存只减了一次；
那这样的场景的解决方案有：
1. 加synchronized锁，示例如下：
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods(){
        // 加同步锁
        synchronized (this){
            // 获取key对应的数据
            Integer stock = redisTemplate.opsForValue().get("stock");
            // 如果库存大于0，对库存减1
            if(null != stock && stock > 0){
                int realStock = stock - 1;
                // 将修改后的库存放入redis
                redisTemplate.opsForValue().set("stock", realStock);
                System.out.println("库存扣减成功，当前库存为：" + realStock);
            } else {
                System.out.println("库存扣减失败");
            }
        }

    }
}
```

### 问题二：多实例部署，synchronized锁失效的问题；
当服务为单机的情况下，加synchronized是可以解决问题的，但是如果多实例部署，那么这个锁就没有效果了；针对新产生的这个问题，可以通过使用redis.setnx()方法来解决；使用redistemplate，操作的是setIfAbsent()方法：
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods() {
//        synchronized (this){
        String lockKey = "stockLock";
        // 针对多实例部署，可以使用setIfAbsent()方法，这个代码实际是redis.setNx()方法
        Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119);
        if (null == aBoolean || !aBoolean) {
            return;
        }
        // 获取key对应的数据
        Integer stock = redisTemplate.opsForValue().get("stock");
        // 如果库存大于0，对库存减1
        if (null != stock && stock > 0) {
            int realStock = stock - 1;
            // 将修改后的库存放入redis
            redisTemplate.opsForValue().set("stock", realStock);
            System.out.println("库存扣减成功，当前库存为：" + realStock);
        } else {
            System.out.println("库存扣减失败");
        }
\t\t  // 操作完成之后，删除锁
        redisTemplate.delete(lockKey);
//        }

    }
}
```

### 问题三：当方法执行过程中代码执行出现异常，锁无法删除的问题：
当方法执行时，如果中间某一步执行发生异常，那么后面的代码是无法执行到的，那也就是说，redistemplate.delete()是执行不到的；这时候的解决方案是使用try-finally或者try-with-resource来解决，代码示例如下；
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods() {
//        synchronized (this){
        String lockKey = "stockLock";
        try {
            // 针对多实例部署，可以使用setIfAbsent()方法，这个代码实际是redis.setNx()方法
            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119);
            if (null == aBoolean || !aBoolean) {
                return;
            }
            // 获取key对应的数据
            Integer stock = redisTemplate.opsForValue().get("stock");
            // 如果库存大于0，对库存减1
            if (null != stock && stock > 0) {
                int realStock = stock - 1;
                // 将修改后的库存放入redis
                redisTemplate.opsForValue().set("stock", realStock);
                System.out.println("库存扣减成功，当前库存为：" + realStock);
            } else {
                System.out.println("库存扣减失败");
            }
            
//        }
        } finally {
            // 操作完成之后，删除锁
            redisTemplate.delete(lockKey);
        }
    }
}
```

### 问题四：如果方法执行过程中，服务整个挂掉了，那么加的锁会一直存在的问题；
当方法执行过程中，服务挂掉了，或者重启了，那没有释放掉的锁会一直存在，解决方案是给这个锁设置一个失效时间；
#### 设置失效方法有两种：
1. 先设置锁，在自行设置失效时间；
2. 在设置锁的同时（并非真正同时，而是redis自己实现的原子操作）设置失效时间；
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods() {
//        synchronized (this){
        String lockKey = "stockLock";
        try {
            // 针对多实例部署，可以使用setIfAbsent()方法，这个代码实际是redis.setNx()方法
            // 给锁设置失效时间，方法有两种：一种是先设置锁，然后在自行设置失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119);
//            redisTemplate.expire(lockKey, 15, TimeUnit.SECONDS);
            // 方法二：在设置锁的同时设置其失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119, Duration.of(15, ChronoUnit.SECONDS)); // 此方法是对下面的额方法传入的时间的一个封装
            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119, 15, TimeUnit.SECONDS);
            
            if (null == aBoolean || !aBoolean) {
                return;
            }
            // 获取key对应的数据
            Integer stock = redisTemplate.opsForValue().get("stock");
            // 如果库存大于0，对库存减1
            if (null != stock && stock > 0) {
                int realStock = stock - 1;
                // 将修改后的库存放入redis
                redisTemplate.opsForValue().set("stock", realStock);
                System.out.println("库存扣减成功，当前库存为：" + realStock);
            } else {
                System.out.println("库存扣减失败");
            }

//        }
        } finally {
            // 操作完成之后，删除锁
            redisTemplate.delete(lockKey);
        }
    }
}
```

### 问题五：当方法还没执行完，锁失效了的问题；
当服务多实例部署是，由于网络，服务器等原因，方法执行时间不等，可能存在在释放锁的时候，这个锁已经失效的情况，或者释放的锁不是本次操作添加的锁，那么这个锁也就失效了；解决方法是在加锁时，添加一个身份标识，在释放锁时，判断这个锁是否自己添加的，示例代码如下：
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private void buyGoods() {
//        synchronized (this){
        String lockKey = "stockLock";
        int nextInt = 0;
        try {
            nextInt = new Random().nextInt(100);
            // 针对多实例部署，可以使用setIfAbsent()方法，这个代码实际是redis.setNx()方法
            // 给锁设置失效时间，方法有两种：一种是先设置锁，然后在自行设置失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119);
//            redisTemplate.expire(lockKey, 15, TimeUnit.SECONDS);
            // 方法二：在设置锁的同时设置其失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119, Duration.of(15, ChronoUnit.SECONDS)); // 此方法是对下面的额方法传入的时间的一个封装
            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, nextInt, 15, TimeUnit.SECONDS);

            if (null == aBoolean || !aBoolean) {
                return;
            }
            // 获取key对应的数据
            Integer stock = redisTemplate.opsForValue().get("stock");
            // 如果库存大于0，对库存减1
            if (null != stock && stock > 0) {
                int realStock = stock - 1;
                // 将修改后的库存放入redis
                redisTemplate.opsForValue().set("stock", realStock);
                System.out.println("库存扣减成功，当前库存为：" + realStock);
            } else {
                System.out.println("库存扣减失败");
            }

//        }
        } finally {
            // 操作完成之后，删除锁
            Integer lockValue = redisTemplate.opsForValue().get(lockKey);
            if(0 != nextInt && null != lockValue && nextInt == lockValue){
                redisTemplate.delete(lockKey);
            }
        }
    }
}
```

### 问题六：失效时间的长短怎么确定，不合适的失效时间如何解决；
当一个方法中使用redis分布式锁，它的失效时间确定多少为合适？这个问题可以通过使用redisson框架来解决，示例代码如下；
```java
public class DistributedRedis {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;
    @Autowired
    private Redisson redisson;

    private void buyGoods() {
//        synchronized (this){
        String lockKey = "stockLock";
//        int nextInt = 0;
        RLock lock = redisson.getLock(lockKey);
        try {
            // 默认失效时间为-1，不失效
            lock.lock(15, TimeUnit.SECONDS);
//            nextInt = new Random().nextInt(100);
            // 针对多实例部署，可以使用setIfAbsent()方法，这个代码实际是redis.setNx()方法
            // 给锁设置失效时间，方法有两种：一种是先设置锁，然后在自行设置失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119);
//            redisTemplate.expire(lockKey, 15, TimeUnit.SECONDS);
            // 方法二：在设置锁的同时设置其失效时间
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, 119, Duration.of(15, ChronoUnit.SECONDS)); // 此方法是对下面的额方法传入的时间的一个封装
//            Boolean aBoolean = redisTemplate.opsForValue().setIfAbsent(lockKey, nextInt, 15, TimeUnit.SECONDS);
//
//            if (null == aBoolean || !aBoolean) {
//                return;
//            }
            // 获取key对应的数据
            Integer stock = redisTemplate.opsForValue().get("stock");
            // 如果库存大于0，对库存减1
            if (null != stock && stock > 0) {
                int realStock = stock - 1;
                // 将修改后的库存放入redis
                redisTemplate.opsForValue().set("stock", realStock);
                System.out.println("库存扣减成功，当前库存为：" + realStock);
            } else {
                System.out.println("库存扣减失败");
            }

//        }
        } finally {
            // 操作完成之后，删除锁
//            Integer lockValue = redisTemplate.opsForValue().get(lockKey);
//            if(0 != nextInt && null != lockValue && nextInt == lockValue){
//                redisTemplate.delete(lockKey);
//            }
            lock.unlock();
        }
    }
}
```