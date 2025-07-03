# local_n8n_static 使用指南

## 概述
`local_n8n_static` 通过免费 CDN 资源替换 n8n 静态资源的方案，有助于优化n8n加载性能。现有问题，每次服务重启，需要手动替换下 `index.html` 文件。

## 基本使用方法
通过以下步骤，使用免费 CDN 资源替换 n8n 静态资源：

1. ### 部署 n8n， 完成 n8n 的常规部署

2. ### 替换 index.html 文件
   - 找到 n8n 部署中的 `/n8n-data/.cache/n8n/public/index.html` 文件（该路径与环境变量 `N8N_USER_FOLDER` 配置相关）。
   - 使用项目中 `/n8n-assets/static/1.*/index_jsdelivr.html` 的内容替换上述文件（目前提供 1.100.1 版本，其他版本现在需自行生成，见下文教程）。
   - 自己部署静态资源：index.html 替换静态资源地址就行


## 自行生成静态资源步骤

### 步骤 1：导出静态文件
将 n8n 启动后生成的 `/n8n-data/.cache/n8n/public/*` 目录下的所有内容导出。

### 步骤 2：生成 index_tmp.html
参照 `/n8n-data/.cache/n8n/public/index.html`，并依据 `1.100.1/index_tmp.html` 的格式，为对应版本创生成 `index_tmp.html`：
- 将访问路径中的占位符 `{{assets_url}}` 替换为实际资源地址。
- 确保加载 `init.js` 和 `translation.js`。
- 插入脚本：`window.local_n8n_static.assets_url = '{{assets_url}}';`

### 步骤 3：修改 index-***.js 文件 
针对 `index-***.js` 文件，需进行多项关键调整（可参考相关图示辅助操作）：
- **获取i18n 实例对象**（参考 `i18n_instance.png`）。
![i18n_instance.png](https://raw.githubusercontent.com/legu2009/n8n-assets/refs/heads/main/img/i18n_instance.png)



- **文本显示增加翻译功能**（参考 `text_translation.png`）
![text_translation.png](https://raw.githubusercontent.com/legu2009/n8n-assets/refs/heads/main/img/text_translation.png)

- **异步加载资源地址修正**（参考 `aysc_url.png`）
![aysc_url.png](https://raw.githubusercontent.com/legu2009/n8n-assets/refs/heads/main/img/aysc_url.png)

- **work 资源地址修正**（参考 `work_url.png`）
![work_url.png](https://raw.githubusercontent.com/legu2009/n8n-assets/refs/heads/main/img/work_url.png)

- **屏蔽 Google 脚本**（参考 `n8n_google.png`）
![n8n_google.png](https://raw.githubusercontent.com/legu2009/n8n-assets/refs/heads/main/img/n8n_google.png)



通过以上步骤，即可完成自定义静态资源的生成与配置，实现 n8n 静态资源的本地化部署。
