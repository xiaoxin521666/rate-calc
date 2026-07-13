const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        // 国内免费汇率接口，无需密钥
        const url = "https://api.huashangbank.com/rate/getLatestRate?fromCurrency=UAH&toCurrency=CNY";
        const res = await axios.get(url, {
            timeout: 20000,
            headers: {
                "User-Agent": "Mozilla/5.0 Node.js GitHubActions"
            }
        });
        const data = res.data;

        // 校验返回汇率
        if (!data.success || !data.data?.rate) {
            throw new Error("无CNY汇率");
        }
        const uahToCny = Number(parseFloat(data.data.rate).toFixed(4));
        console.log(`实时汇率：1 UAH = ${uahToCny} CNY`);

        // 修改网页汇率文字
        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", html, "utf8");

        console.log("汇率更新完成，已写入index.html");
    } catch (err) {
        console.error("汇率获取失败：", err.message);
        process.exit(1);
    }
}

updateRate();
