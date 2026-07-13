const axios = require('axios');
const fs = require('fs');

// 真实稳定数据源： exchangerate-api 海外通用，不会403，无汇率倒置
async function getRate() {
    try {
        // 获取USD/UAH、USD/CNY，交叉换算，精准不颠倒
        const res = await axios.get('https://v6.exchangerate-api.com/v6/latest/USD');
        const data = res.data.conversion_rates;
        const uahPerUsd = data.UAH;
        const cnyPerUsd = data.CNY;
        // 1 UAH = 多少CNY
        const oneUahToCny = Number((cnyPerUsd / uahPerUsd).toFixed(4));
        console.log(`汇率获取成功：1 UAH = ${oneUahToCny} CNY`);
        return oneUahToCny;
    } catch (e) {
        console.error('汇率接口获取失败', e.message);
        // 兜底固定参考汇率，防止脚本崩溃
        return 0.195;
    }
}

async function updateHtml() {
    const rate = await getRate();
    let html = fs.readFileSync('./index.html', 'utf8');
    // 替换页面展示文字
    html = html.replace(/1 UAH = [0-9.]+ CNY/, `1 UAH = ${rate} CNY`);
    // 替换计算变量
    html = html.replace(/const uah2cny = [0-9.]+;/, `const uah2cny = ${rate};`);
    fs.writeFileSync('./index.html', html, 'utf8');
    console.log('index.html汇率文本与计算变量更新完成');
}

updateHtml();
