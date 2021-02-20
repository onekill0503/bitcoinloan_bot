// Load Enviroment Variables
require('dotenv').config();
const conf = process.env;

// Load Library
const axios = require('axios');
const telegraf = require('telegraf').Telegraf;
const Telegram = require('telegraf/telegram')

// configuration bot
const bot = new telegraf(conf.BOT_API);
const tele = new Telegram(conf.BOT_API);

const convertCurrency = value => value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
const getLow = (list) => {
    var l = Number.MAX_SAFE_INTEGER;
    list.map(v => {
      if (v[1] < l) {
        l = v[1];
      }
    });
    return l;
}
const getHigh = (list) => {
    var l = 0;
    list.map(v => {
      if (v[1] > l) {
        l = v[1];
      }
    });
    return l;
}

bot.command("howtogetbitcoinloan" , async ctx => {
    let message = "How to get a bitcoin loan:\n\n";
    message += "1. KYC form registration https://forms.gle/2N461pXo5e1Yv9La9\n\n";
    message += "2. Confirmation of KYC (pass / fail)\n\n";
    message += "3. Then deposit 10% of your loan amount\n\n";
    message += "4. Wait verification of 10% deposit.\n\n";
    message += "5. After payment is verified wait 30min maximum 24hours for loan arrival in wallet."
    await ctx.reply(message);
})

bot.command("howtogetbitcoinloan_my", async ctx => {
    let message = "Cara mendapatkan pinjaman bitcoin: \n\n";
    message += "1. Pendaftaran borang KYC, https://forms.gle/2N461pXo5e1Yv9La9\n\n";
    message += "2. Pengesahan KYC (lulus / gagal)\n\n";
    message += "3. Kemudian depositkan 10% daripada jumlah pinjaman anda\n\n";
    message += "4. Tunggu pengesahan deposit 10%.\n\n"
    message += "5. Setelah pembayaran disahkan tunggu 30 minit maksimum 24 jam lepas tu tuan/puan akan dapat loan.company akan terus send loan ke bitcoin wallet addres tuan/puan terima kasih."
    await ctx.reply(message);
})

bot.command('btcprice' , async ctx => {
    const coin_symbol = 'btc';
    const coinlist = await axios.get("https://api.coingecko.com/api/v3/coins/list" , {headers : {'accept' : 'application/json'}});
    var coinId;
    for(const coin of coinlist.data){
        if(coin.symbol == coin_symbol){
            coinId = coin;
            break;
        }
    }
    if(coinId != undefined){
        const coinData = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId.id}` , {headers : {'accept' : 'application/json'}});
        if(coinData.status == 200){
            const happy = decodeURIComponent(escape("\xF0\x9F\x98\x81"));
            const sad = decodeURIComponent(escape("\xF0\x9F\x98\x94"));
            var dateFormat;
            const marketcap = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId.id}/market_chart?vs_currency=usd&days=1`);
            const simple = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId.id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`)
            const low = getLow(marketcap.data.prices);
            const high = getHigh(marketcap.data.prices);
            const volum = Number(simple.data[coinId.id].usd_24h_vol);
            const pricenow = Number(simple.data[coinId.id].usd);
            
            const d = new Date();
            d.setDate(d.getDate() - 6);
            dateFormat = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
            console.log(dateFormat)
            const day7H = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId.id}/history?date=${dateFormat}`);
            const day7 = day7H.data.market_data.current_price.usd.toFixed(2);
            d.setDate(d.getDate() - 7);
            dateFormat = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
            console.log(dateFormat)
            const day14H = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId.id}/history?date=${dateFormat}`);
            const day14 = day14H.data.market_data.current_price.usd.toFixed(2);

            const dif7 = Math.abs(pricenow - day7);
            const dif14 = Math.abs(pricenow - day14);
            
            const day1P = simple.data[coinId.id].usd_24h_change.toFixed(2);
            const day7P = (pricenow - day7 < 0 ? "-" : "") + ((dif7 / day7) * 100).toFixed(2);
            const day14P = (pricenow - day14 < 0 ? "-" : "") + ((dif14 / day14) * 100).toFixed(2);

            // Generate Message
            let message = `<pre>${coinId.name} $${convertCurrency(pricenow)}\n`;
            message += `L: $${convertCurrency(low)}\t|H: $${convertCurrency(high)}\n`;
            message += `24H\t : ${day1P} % ${day1P >= 0 ? happy : sad}\n`;
            message += `7D\t : ${day7P} % ${day7P >= 0 ? happy : sad}\n`;
            message += `14D\t : ${day14P} % ${day14P >= 0 ? happy : sad}\n`;
            message += `Vol : $${convertCurrency(volum)}</pre>`;

            ctx.reply(message , {parse_mode: 'HTML'});
        }
    }
})

bot.command('calc' , async ctx => {
    const amount = ctx.message.text.split(' ')[1];
    if(!isNaN(parseFloat(amount))){
        const amount_int = parseFloat(amount);
        const collateral = parseFloat(amount * 0.1);
        const interest = parseFloat(amount * 0.05);
        const repayment = parseFloat(amount + interest);
        const period = 1;

        let message = `Loan ( ${amount_int} BTC )\n`;
        message += `Collateral Fee ( ${collateral} BTC )\n`;
        message += `Interest ( ${interest} BTC )\n`;
        message += `Repayment Period ( ${period} Year${period > 1 ? 's':''} )\n`;
        message += `Total Repayment ( ${repayment} BTC )\n\n`;
        message += `Repayment is made at the exact rate at which loan is received in Fiat.`;

        ctx.reply(message);
    }else {
        ctx.reply(`Missing Bitcoin Amount !\nExample Usage : <pre>/calc 1</pre>` , {parse_mode: 'HTML'})
    }
})

bot.use(async (ctx, next) => {
    const start = new Date()
    await tele.deleteMessage(ctx.message.chat.id , ctx.message.message_id);
    await next()
    const ms = new Date() - start
    console.log(`Response message time from ${ctx.from.username}: ${ms}ms`)
});

bot.on('text' , ctx => {

})

bot.on('new_chat_members' , async ctx => {
    await ctx.reply(`Hello ${ctx.from.first_name} !\nWelcome to Bitcoin loan community.`)
})

bot.on('left_chat_member' , ctx => tele.deleteMessage(ctx.message.message_id));

bot.launch();