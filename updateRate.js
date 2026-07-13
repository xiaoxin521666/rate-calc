const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        // 国内财经接口，Github海外机器可正常访问
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/UAH', {
            timeout:25000,
            headers:{
                "User-Agent":"Mozilla/5.0 Windows Chrome 120"
            }
        });
        const data = res.data;
        const rate = Number(data.rates.CNY.toFixed(4));
        console.log(`✅ 获取汇率：1UAH = ${rate}CNY`);

        let html = fs.readFileSync('index.html','utf8');
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g,`今日自动更新汇率：1 UAH = ${rate} CNY`);
        html = html.replace(/const uahToCny = [0-9.]+;/g,`const uahToCny = ${rate};`);
        fs.writeFileSync('index.html',html,'utf8');
        console.log("✅ 页面更新完成");
    } catch (e) {
        // 接口失败不终止流程，保留旧汇率继续部署
        console.log("⚠️ 汇率接口访问失败，保留原有汇率");
        process.exit(0);
    }
}
updateRate();
