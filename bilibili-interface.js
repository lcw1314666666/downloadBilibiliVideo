const { bili } = require('./bilibili.js');

class BiliBili {
    constructor(){this.sessdata='' }
    setSessdata(ps){this.sessdata=ps}
    MultiEpisodesInfo(url, parse, callback){bili[2](url, parse).then(r=>{callback(r)})}
    MultiEpisodesDownload(url, path, ep, fnval, format){bili[6](url, path, ep, fnval, format)}
    VideoAudioJoin(path, video, audio, file){bili[5](path, video, audio, file)}
    VideoDownload(url, referer, path, format){bili[4](url, referer, path, format)}
    VideoInfo=(url, ep, fnval, bvid, cid, epid=false)=>bili[3](url, ep, fnval, bvid, cid, epid, this.sessdata)
}

module.exports = { BiliBili }
