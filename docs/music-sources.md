# 免费音乐资源与 Jamendo 接入准备

资料核对：2026-10-19。当前项目已接入免费精选、Radio Browser 电台和 Internet Archive 开放音频；Jamendo 本次仅完成资源调研，尚未配置或接入。

## 需要免费 Key 的服务：Jamendo

Jamendo 提供独立音乐的曲目、歌手、专辑、搜索和在线播放接口，适合扩充学习与氛围音乐曲库。歌曲接口返回 `audio` 播放地址与 `license_ccurl` 授权地址，可接到现有播放器。

- [开发者申请入口](https://devportal.jamendo.com/)
- [认证与 Client ID 说明](https://developer.jamendo.com/v3.0/authentication)
- [曲目搜索与播放接口](https://developer.jamendo.com/v3.0/tracks)
- [官方 API 使用条件](https://devportal.jamendo.com/api_terms_of_use)
- [GitHub 参考：Maniesta Play](https://github.com/usmannmurtazaa/Maniesta-Play)：使用原生 JavaScript 与 Jamendo API，展示搜索、歌单、收藏及全局播放器；作为接入方式参考，未安装或复制其代码。

### 申请步骤

1. 在 Jamendo 开发者门户注册并登录。
2. 创建一个应用，填写实际名称、用途和项目地址。
3. 使用默认的 Read only 方案，即可访问公开曲库读取接口。
4. 获取该应用自己的 `Client ID`。公开曲目搜索与播放所需的凭据是 `client_id`；无需用户登录授权，也无需提供 `Client Secret`。

不要将 `Client Secret`、访问令牌或账号密码放进前端、文档或聊天中。官方文档内的公共演示 ID 仅供测试，不用于正式网站。正式接入可通过服务端或托管函数读取应用配置并转发查询；当前静态 Astro 项目尚未增加该配置或转发接口。

### 免费范围

- 官方条款允许非商业 API 使用；广告、联盟收益等商业用途需联系 Jamendo 确认方案。
- 这是独立音乐曲库，不保证收录国内商业平台的热门歌曲。
- 免费收听不等于可以任意再分发、剪辑或商用；保留歌手、来源和每首作品的授权信息。
- 官方可以限制请求次数与频率；没有把第三方页面宣传的固定月额度当作保证。实际限制以开发者账户和官方当前条款为准。
- 接入方案采用在线播放，不将音乐存入本地导入使用的 IndexedDB，也不复制参考项目的离线下载功能；官方条款限制以内容缓存、离线访问为目的的应用设计。

## 当前无需 Key 的资源

| 资源 | 当前用途 | Key |
| --- | --- | --- |
| Scott Buckley 官方音乐库 | 6 首完整精选纯音乐，保留 CC BY 4.0 署名 | 无需 |
| Radio Browser | 按风格寻找公开直播电台 | 无需 |
| Internet Archive | 搜索元数据标注开放授权的音频，保留来源 | 无需 |

现有功能与来源见 [音乐模式说明](music-mode.md)。
