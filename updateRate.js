const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        const url = `https://bank.gov.ua/NBU_Exchange/exchange_site?json`;
        const res = await axios.get(url, { timeout: 15000 });
        const list = res.data;
        const cnyData = list.find(item => item.valcode === "CNY");
        if (!cnyData || !cnyData.rate) throw new Error("无CNY汇率");
        const uahToCny = Number((cnyData.rate / 100).toFixed(4));
        console.log(`实时汇率：1 UAH = ${uahToCny} CNY`);

        let html = fs.readFileSync("index.html", "utf8");
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", html, "utf8");
        console.log("汇率更新完成");
    } catch (err) {
        console.error("汇率获取失败：", err.message);
        process.exit(1);
    }
}
updateRate();
