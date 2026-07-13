const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        // 新稳定接口
        const url = "https://api.fastforex.io/fetch-one?from=UAH&to=CNY&api_key=demo";
        const res = await axios.get(url, {
            timeout: 25000,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/120"
            }
        });
        const data = res.data;
        // 解析汇率
        const uahToCny = Number(data.result.CNY.toFixed(4));
        console.log(`✅ 拉取新汇率：1 UAH = ${uahToCny} CNY`);

        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", "utf8", html);
        console.log("✅ HTML汇率替换完成");
    } catch (err) {
        console.error("❌ 请求失败：", err.message);
        process.exit(1);
    }
}

updateRate();
