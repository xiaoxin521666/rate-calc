const axios = require('axios');
const fs = require('fs');

// 正确完整密钥（和你提供的完全一致，区分大小写）
const API_KEY = "06eeef79E5D09C416E10CE2A";

async function updateRate() {
    try {
        const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/UAH`;
        const res = await axios.get(url, {
            timeout: 20000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const data = res.data;

        if (data.result !== "success" || !data.conversion_rates?.CNY) {
            throw new Error("接口返回数据异常，无CNY汇率");
        }

        const uahToCny = Number(data.conversion_rates.CNY.toFixed(4));
        console.log(`✅ 请求成功，实时汇率：1 UAH = ${uahToCny} CNY`);

        let html = fs.readFileSync("index.html", "utf8");
        // 替换页面展示文字
        html = html.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        // 替换页面JS汇率变量
        html = html.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", html, "utf8");

        console.log("✅ index.html 汇率文本替换完成");
    } catch (err) {
        console.error("❌ 执行失败：", err.message);
        process.exit(1);
    }
}

updateRate();
