---
title: "前端上传文件到云（七牛云）"
excerpt: "前端项目中，直接上传文件/图片到云存储（以七牛云为例）的实现方法"
date: "2021-09-18T01:05:12Z"
seo:
  tags: [
    "file",
    "upload",
    "typescript",
    "qiniu-js"
  ]
---

> 之前看了几次七牛云的文档，折腾了几次，没有成功，然后又开始了各种找资料，看文档，看示例，终于搞定了。

项目中使用的是vite.js构建的，而且用的是typescript，网上的示例几乎没有，下面来一步步记录如何实现，七牛云的示例代码直接访问是无法访问的，这里就不挂地址了，直接看过程。

#### 首先安装qiniu-js和crypto-js两个依赖，qiniu-js就是上传，crypto-js是生成token时需要加密用的工具，安装命令如下：

```sh
yarn add crypto-js qiniu-js -D
```

在工具/插件目录下新建upload.ts文件，参照官方文档来写上传方法，加密、生成token的方法，首先是上传方法，最终代码如下：

```ts
import * as qiniu from 'qiniu-js';
import CryptoJS from 'crypto-js'

// 请求接口上传图片
export function uploadFile(file: File) {
    // 参数依次为：accessKey, secretKey, bucketName
    const uptoken = getToken("ss", "xx", "xx");
    const key = file.name;
    const config = {
        useCdnDomain: true,
        region: qiniu.region.z2,
        forceDirect: true // 是否上传全部采用直传方式
    };
    const putExtra: any = {
        fname: file.name, //文件原文件名
        mimeType: ['image/png', 'image/jpeg', 'image/gif'] //用来限制上传文件类型，为 null 时表示不对文件类型限制；
    };
    return qiniu.upload(file, key, uptoken, putExtra, config);
}
```
> 注意这里最终返回的是upload()的执行结果，是一个对象，里面有next, error, complete，这里不处理过程和结果，直接返回，在使用的地方进行处理。

**_uploadFile()方法需要暴露出去，供组件中使用_**

其中getToken()方法的三个参数分别是：accessKey、secretKey、bucketName，需要登录自己的七牛云账号查看，具体操作登陆后，点击头像，然后点击密钥管理，就能看到了，getToken()方法最终代码如下：

```ts
function getToken(access_key: string, secret_key: string, bucketname: string) {
    // 构造策略
    var putPolicy = {
        "scope": bucketname,
        "deadline": 3600 + Math.floor(Date.now() / 1000)
    }
    var encoded = base64Encode(utf16to8(JSON.stringify(putPolicy)));
    var hash = CryptoJS.HmacSHA1(encoded, secret_key);
    // 构造凭证
    var encodedSign = hash.toString(CryptoJS.enc.Base64).replace(/\//g, '_').replace(/\+/g, '-');
    var uploadToken = access_key + ':' + encodedSign + ':' + encoded;
    return uploadToken;
}
```
getToken()方法中的base64Encode()和utf16to8()这两个方法的代码实现如下：

```ts
function base64Encode(str: string) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}
```

```ts
function utf16to8(str: string) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}
```
整个上传的方法就完成了，然后在组件使用，示例如下：

```ts
import { uploadFile } from "../../plugins/upload";
```
在html中添加控件，示例如下：

```html
<div class="mx-auto text-center">
    <div class="text-center text-gray-600">
          <label
              for="file-upload"
              class="relative cursor-pointer bg-white rounded-md text-gray-400 hover:text-indigo-500"
           >
                <svg
                   class="mx-auto h-8 w-8"
                   stroke="currentColor"
                   fill="none"
                   viewBox="0 0 48 48"
                   aria-hidden="true"
                >
                   <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                   />
                    </svg>
                    <input
                      id="file-upload"
                      name="cover"
                      type="file"
                      class="sr-only"
                      accept="image/png,image/jpeg,image/jpg"
                      @change="uploadImage($event.target.files)"
                    />
               </label>
          </div>
    <p class="text-xs text-gray-500">png, jpeg, jpg</p>
    <p class="text-xs text-gray-500">up to 2MB</p>
</div>
```

在方法中调用uploadFile方法，下面示例只上传一个文件：

```ts
// 上传文件
    uploadImage(files: Array<File>) {
      if (files.length > 0) {
        uploadFile(files[0]).subscribe({
          next: (result) => {
          },
          error: () => {
          },
          complete: (e) => {
            let data = {
              ...this.postsData,
              cover: "https://cdn.leafage.top/" + e.key,
            };
            this.postsData = data;
          },
        });
      }
    },
```