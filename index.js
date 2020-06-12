const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');
axios.defaults.timeout = 5000;
const fs = require('fs');
const readline = require('readline');

let proxies_list = []
const valid = []

function start(){
    readline.createInterface({
        input: fs.createReadStream("proxies.txt"),
        terminal: false
    }).on('line', function(line) {
        proxies_list.push(line)
    }).on('close', ()=>main());
}


async function check(ip_port) {
    try {
        const httpsAgent = new SocksProxyAgent(`socks5://${ip_port}/`);
        const client = axios.create({ httpsAgent: httpsAgent });
        const response = await client.get('https://api.ipify.org')
        console.log(ip_port+" valid")
        if (response.data === ip_port.slice(0, ip_port.indexOf(":"))) {
            valid.push(ip_port)
        }
    } catch (error) {
        console.log(ip_port+" error")
    }
}

async function main() {
    console.log(`Loaded ${proxies_list.length} ips`)
    proxies_list = [...new Set(proxies_list)];
    console.log(`ips after deduplication ${proxies_list.length}`)
    const promises=[]
    for (let proxy of proxies_list) {
        promises.push(check(proxy))
    }
    await Promise.allSettled(promises)
    fs.writeFile("./valid.json", JSON.stringify(valid), function (err) {
        if (err) {
          console.log(err)
        }
      })
    console.log(valid)
}
start()