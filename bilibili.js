const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cmd = require('node-cmd');
const process = require('process');
const events = require('events');

(function (g, x, r, h, d, m) {
    let e = this
    g.req = r
    g.reqh = h
    g.downl = d
    g.bili = m
    x = g
    m[1](r, h, d)
})(this, module.exports, function (args, resolve, method='get') {
    let obj = {'method': method}
    if (typeof args === 'object')
        for (let k in args)
            obj[k] = args[k]
    axios(obj).then(function (res_json) {
        resolve(res_json)
    }).catch(function (error) {
        console.log(error)
    })
}, function (args=false) {
    headers = {"user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 "}
    if (typeof args === 'object')
        for (let k in args)
            headers[k] = args[k]
    return headers
}, function (u, h, p, r, l) {
    return new Promise ((res, err) => {
        r({'url': u, 'headers': h, responseType: 'stream'}, d => {
            let os = d.headers['content-length'],
                e = fs.existsSync(p),
                es = 0,
                itv = 5000,
                m =  'w', w, s, t, o
            if (e) {s = fs.statSync(p); if (s.isFile) es = s.size}
            if (es == os) {res(true); return}
            else if (es > os) fs.unlink(p, function(err) {if(err) throw err})
            else {m = 'a'; h.range = `bytes=${es}-`}
            w = fs.createWriteStream(p, {flags: m, highWaterMark: 3})
            d.data.pipe(w)
            o = () => {l(fs.statSync(p).size, os)}
            w.on('open', () => {console.log('[ Open ]', p);t = setInterval(function(){o()}, itv);})
            w.on('ready', () => {/*console.log('Ready');*/})
            w.on('finish', () => {o();res(true);console.log('[ Finish ]', p)})
            w.on('close', () => {clearInterval(t);console.log('[ close ]', p)})
            w.on('error', () => {res(false);clearInterval(t);console.log('[ Error ]', p)})
        })
    })
}, {1: function (r, h, d) {
        let e = this
        e.ptc = 'https'
        e.sn = 'www'
        e.dmn = 'bilibili.com'
        e.hn = [e.sn, e.dmn].join('.')
        e.r = r
        e.h = h
        e.l = d
        e.clog = console.log
        e.c = (s, c) => {
            let i = s.search(c)
            return i == -1 ? s : s.substring(i+c.length)
        }
        e.mn = u => {
            let c = e.c(u, e.hn)
            switch (c.substring(0, c.lastIndexOf('/'))) {
                case '/video': return 0
                case '/bangumi/play': return 1
                default: return -1
            }
        }
        e.ma = n => {
            switch (n) {
                case 0: return 'https://api.bilibili.com/x/player/playurl'
                case 1: return 'https://api.bilibili.com/pgc/player/web/playurl'
                default: return -1
            }
        }
    }, 2: function (u, g=true) {
        let e = this, m = e.mn(u),
            c = c => {
                let re = /window.__INITIAL_STATE__=.*?;\(function/,
                    pl = "window.__INITIAL_STATE__=".length,
                    nl = ";(function".length,
                    rl = 0,
                    r = re.exec(c)
                if (r == null) return null
                rl = r[0].length
                return JSON.parse(r[0].substring(pl, rl-nl))
            }, p = d => {
                let i, p, t, s
                switch (m) {
                    case 0: i = d['videoData']; break
                    case 1: i = d['mediaInfo']; break
                }
                t = i['title']
                s = {'url': u, 'title': t, 'epInfo': []}
                switch (m) {
                    case 0: p = i['pages']; break
                    case 1: p = d['epList']; break
                }
                for (let j in p) {
                    switch (m) {
                        case 0:
                            s['epInfo'].push({'cid': p[j]['cid'], 'bvid': i['bvid'],
                                'id': false, 'ep': j + 1, 'title': p[j]['part']}); break
                        case 1:
                            s['epInfo'].push({'cid': p[j]['cid'], 'bvid': p[j]['bvid'],
                                'id': p[j]['id'], 'ep': parseInt(j) + 1, 'title': p[j]['longTitle']}); break
                    }
                }
                return s
            }, d = new Promise((res, err) => {
                e.r({"url": u, "headers": e.h()}, r => {
                    res(g?p(c(r.data)):c(r.data))
                })
            })
        e.d = () => d
        return d
    }, 3: function (u, e, f, b, c, i=false, sa='') {
        let t = this,
            h = t.h({"cookie": `SESSDATA=${sa};`, "referer": u}),
            p = {"otype": "json", "qn": 16, "fnval": f, "cid": c, "bvid": b},
            d = j => {
                let r = j['result']
                if (r == undefined) r = j['data']
                if (r['durl'] != undefined) return [r['durl'][0]['url']]
                else if (r['dash'] != undefined) {
                    let d = r['dash'],
                        v = d['video'],
                        a = d['audio'][0]
                    for (let i of v)
                        if (i['id'] == e)
                        {v = i; break}
                    return [v['base_url'], a['base_url']]
                } else return false
            },
            hc = (q, r) => {
                if (r.findIndex(r=>r==q) == -1)
                    q > r[0] ? p['qn'] = r[0] : q < r[r.length-1] ? p['qn'] = r[r.length-1] : p['qn'] = q
                e = p['qn']
            }
        if (i) p['ep_id'] = i
        return new Promise((res, err) => {
            t.r({'url': t.ma(t.mn(u)), 'headers': h, 'params': p}, r => {
                status = r.data['code'] == 0
                if (status) {
                    let aq = r.data.data.accept_quality,
                        af = r.data.data.accept_format
                    hc(e, aq)
                    t.r({'url': t.ma(t.mn(u)), 'headers': h, 'params': p}, r => {
                        status = r.data['code'] == 0
                        if (status) res(d(r.data))
                        else err([u, h, p])
                    })
                } else console.log(t.ma(t.mn(u)), '[ 请求失败 ]')
            })
        })
    }, 4: function (u, r, p, l=(e, o)=>{console.log(`${parseInt(e/o*100)}%`)}) {
        let e = this
        h = e.h({"accept": "*/*",
            "accept-encoding": "identity",
            "accept-language": "zh-CN,zh;q=0.9",
            "origin": "https://www.bilibili.com",
            "range": "bytes=0-",
            "referer": r})
        e.clog(p, '>>>>>>>>', 'Loading!')
        return new Promise((res, err) => {
            e.l(u, h, p, e.r, l).then((r, e) => {
                res(r)
            })
        })
    }, 5: function (p, v, a, f) {
        return new Promise((r, e) => {
            process.chdir(p)
            cmd.run(`ffmpeg -i ${v} -i ${a} -codec copy ${f}`,
                function(err, data, stderr){
                    let s = err ? false : true
                    r(s); e(err)
                    console.log(data)
                })
        })
    }, 6: function (u, p='./', ep=64, fnv= 80, f=(n, t)=>`${n}.${t}`) {
        let t = this
        t[2](u).then(r => {
            let d = r['epInfo'],
                dn = r['title'],
                e = fs.existsSync(p),
                /*
                    这里比较建议使用 string 的 replace(正则公式，替换字符)
                    s = s.replace(/[^[\\\/:*?<>|\s]]/g, '_')
                */
                pfn = (s, sig='_') => {
                    let a = ['\\', '/', ':', '*', '?', '<', '>', '|', ' ']
                    s = s.split('')
                    for (let i in s)
                        if (a.findIndex(r=>r==s[i]) == 1) s[i] = sig
                    return s.join('')
                }
            if (e) {let s = fs.statSync(p); if (!s.isDirectory) fs.mkdirSync(p)}
            else {fs.mkdirSync(p)}
            p = path.join(p, dn)
            if (!fs.existsSync(p)) fs.mkdirSync(p)
            d.map(i => {
                let fn = f(i['ep'], d.length == 1 && i['title'] == '' ? dn : i['title']),
                    lfn = `${pfn(fn).split(' ').join('_')}.flv`,
                    plfn = path.join(p, lfn)
                t[3](u, ep, fnv, i['bvid'], i['cid'], i['id']).then(r => {
                    let l = r.length
                    switch (l) {
                        case 1:
                            t.FileDownload(r[0], u, path.join(p, lfn)); break
                        case 2:
                            let v = `v_${i['ep']}.m4s`,
                                a = `a_${i['ep']}.m4s`,
                                vp = path.join(p, v),
                                ap = path.join(p, a),
                                EventEmitter = new events.EventEmitter(),
                                delp = () => {
                                    fs.unlink(vp, err => {if (err) console.log(err)})
                                    fs.unlink(ap, err => {if (err) console.log(err)})
                                }
                        async function d () {
                            let vs = await t[4](r[0], u, vp),
                                va = await t[4](r[1], u, ap)
                            return vs && va
                        }
                            d().then(r => {
                                let s = fs.existsSync(plfn)
                                if (r && !s) t[5](p, v, a, lfn).then(l => {
                                    EventEmitter.emit('read', l);
                                })
                            })
                            EventEmitter.on('read', function(res){
                                //处理异步读取得到的数据
                                if (res) delp()
                                else if (!fs.existsSync(plfn)) delp()
                            })
                            break
                    }
                }).catch(e => {console.log(e)})
            })
        })
    }
})
