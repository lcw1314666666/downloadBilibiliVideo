const { BiliBili } = require('./bilibili-interface.js')
/*
	功能类的实例化（主要用于下载，局部页面数据仅供使用）
*/
var b = new BiliBili()
/*
	Sessdata 身份验证：存放于 Cookie, 每登录一次，该id会自动变更
*/
b.setSessdata('')
/*
	页面基本数据获取，可获取解析前后的数据，parse(true/false)
*/
// b.MultiEpisodesInfo('https://www.bilibili.com/bangumi/play/ss33378?t=270', true, r => {
//     let d = r['epInfo']
//     /*
// 		获取具体集数(episodes)的视频播放数据，可用于下载
// 	*/
//     b.VideoInfo('https://www.bilibili.com/bangumi/play/ss33378?t=270', 64, 80,  d[2]['bvid'], d[2]['cid'], d[2]['id']).then(o => {
//         console.log(o)
//     })
// })
/*
	视频多p下载, 后面的 n 为p号，t 为各p标题，具体作用是什么格式输出文件名
*/
b.MultiEpisodesDownload('https://www.bilibili.com/video/BV1mS4y1Y7cD?spm_id_from=333.999.0.0', './', 64, 80, (n, t) => t).then(res => {
    console.log('下载完成')
})

