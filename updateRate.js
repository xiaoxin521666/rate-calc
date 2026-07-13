const axios = require('axios');
const fs = require('fs');

async function updateRate() {
    try {
        // 中行公开汇率接口
        const url = "https://www.boc.cn/sourcedb/whpj/index.html";
        const res = await axios.get(url, { timeout: 15000 });
        let htmlText = res.data;

        // 匹配乌克兰格里夫纳UAH现汇卖出价（中行单位：100外币兑人民币）
        const reg = /乌克兰格里夫纳.*?<td>([\d.]+)<\/td>/s;
        const match = htmlText.match(reg);
        if (!match) throw new Error("未抓取到乌克兰格里夫纳汇率");

        // 换算：100UAH = match[1]元人民币，除以100得到1UAH价格
        const hundredUahCny = parseFloat(match[1]);
        const uahToCny = Number((hundredUahCny / 100).toFixed(4));
        console.log(`实时汇率：1 UAH = ${uahToCny} CNY`);

        // 替换网页两处汇率文本
        let pageHtml = fs.readFileSync("index.html", "utf8");
        pageHtml = pageHtml.replace(/今日自动更新汇率：1 UAH = [0-9.]+ CNY/g, `今日自动更新汇率：1 UAH = ${uahToCny} CNY`);
        pageHtml = pageHtml.replace(/const uah2cny = [0-9.]+;/g, `const uah2cny = ${uahToCny};`);
        fs.writeFileSync("index.html", pageHtml, "utf8");

        console.log("汇率更新完成，已写入index.html");
    } catch (err) {
        console.error("汇率获取失败：", err.message);
        process.exit(1);
    }
}

updateRate();
