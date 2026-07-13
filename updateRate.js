const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        // 国内直连无密钥接口
        const url = `https://api.exchangerate.host/latest?base=UAH&symbols=CNY`;
        const res = await axios.get(url, {
            timeout: 20000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"
            }
        });
        const data = res.data;

        if (!data.rates || !data.rates.CNY) {
            throw new Error("未获取UAH兑CNY汇率");
        }

        const uahToCny = Number(data.rates.CNY.toFixed(4));
        console.log(`✅ 新汇率：1 UAH = ${uahToCny} CNY`);

        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", "utf8");
        console.log("✅ 页面汇率更新完成");
    } catch (err) {
        console.error("❌ 失败：", err.message);
        process.exit(1);
    }
}

updateRate();
