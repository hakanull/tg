const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Telegram botunuzun token'ını buraya yazın
const token = '7051122368:AAHCPUk_il-WyFTJbewvVPP5p41hRnioPXI';
const bot = new TelegramBot(token, { polling: true });

// Telegram'da CSV dosyasını göndermek için kullanılacak sohbet ID'si
const chatId = '-4192597839';

const url = "https://europe-west1-valuezon.cloudfunctions.net/s8-ll";

let params = {
    "id": "1762",
    "cid": "1762",
    "au": "undefined",
    "t": "SMS",
    "d": "a",
    "fut": "0",
    "da": "ex",
    "ft": "CSV",
    "ob": "`recipient`",
    "s": "ASC",
    "k": "",
    "f": "5",
    "clr": "",
    "slcs": "250",
    "slsrc": "SYSTEM",
    "dv": "0",
    "a": "0",
    "sn": "",
    "sm": "0,319,454,530,1318,1328,1362,1402,1403,1647,1648,1649,1861,2104,2139,2297,2352,2744,2898,2917,2991,3003,3048,3108,3314,3394,3407,3439,3440,3740,3750,3751,3752,3756,3758,3759,3765,3778,3779,3781,3784,3785,3786,3787,3795,3796,3798,3813,3814,3817",
    "_time": "1710308813625",
    "l": "tr",
    "p": "1",
    "items": "25000"
};

const headers = {
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'iframe',
    'referer': 'https://login.guvenmedia.com/',
    'accept-language': 'en-US,en;q=0.9,th;q=0.8,tr-TR;q=0.7,tr;q=0.6',
    'dnt': '1'
};

// Fonksiyon: sd ve ed parametrelerini güncelle
function updateParams() {
    const today = new Date();
    const previousDay = new Date(today);
    previousDay.setDate(today.getDate() - 1);
    const formattedDate = previousDay.toISOString().split('T')[0];
    params.sd = formattedDate;
    params.ed = formattedDate;
    return `${formattedDate}_OTP_Datası.csv`;
}

// Fonksiyon: CSV dosyasını oluştur ve Telegram'a gönder
async function sendCsvToTelegram() {
    try {
        const fileName = updateParams();
        bot.sendMessage(chatId, "OTP datası işleniyor...");
        const response = await axios.get(url, { params: params, headers: headers });
        fs.writeFileSync(fileName, response.data, 'utf-8'); // utf-8 karakter kodlamasını kullanarak dosyayı yaz
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        const formattedCurrentDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        bot.sendDocument(chatId, fileName, { caption: `${formattedCurrentDate} OTP Datası ✉` });
        console.log("OTP datası işlenerek CSV dosyası oluşturuldu ve Telegram'a gönderildi.");
    } catch (error) {
        console.error("Hata:", error);
    }
}

// Her gün 00:05'te sendCsvToTelegram fonksiyonunu çalıştır
cron.schedule('32 18 * * *', () => {
    sendCsvToTelegram();
});

// Bot komutları
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Bot başlatıldı. Her gün 00:05\'te o günün OTP datasını gönderecek.');
});

// Botu başlat
console.log("Bot başlatıldı. Her gün 00:05'te o günün OTP datasını gönderecek.");
