const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mode = null;
        this.list = [];
    }

    async start(msg){
        this.mode = "main"
        const text = this.loadMessage("main");
        await this.sendImage("main")
        await this.sendText(`${text}`)
        await this.showMainMenu({
            "start": "главное меню бота",
            "profile": "генерация Tinder-профиля 😎",
            "opener": "сообщение для знакомства 🥰",
            "message": "переписка от вашего имени 😈",
            "date": "переписка со звездами 🔥",
            "gpt": "задать вопрос чату GPT",
        })
    }

    async html(msg){
        await this.sendHTML(`<h3>ssss</h3>`)
        const html = this.loadHtml("main");
        await this.sendHTML(html, {theme:"dark"})
    }

    async gpt(msg) {
        this.mode = "gpt"
        await this.sendImage("gpt")
        const text = this.loadMessage("gpt");
        await this.sendText(`${text}`)
    }

    async gptDialog(msg) {
        const text = msg.text;
        await this.sendImage("gpt")
        const myMessage = await this.sendText("Ответ на ваш вопрос таков...")
        const answer = await chatgpt.sendQuestion("Ответь на вопрос", text)
        await this.editText(myMessage, answer)
    }

    async date(msg){
        this.mode = "date";
        await this.sendImage("date")
        const text = this.loadMessage("date");
        await this.sendTextButtons("Список доступных профилей:",{
            "date_grande":"Ариана Гранде",
            "date_robbie":"Марго Робби",
            "date_zendaya":"Зендея",
            "date_gosling":"Райан Гослинг",
            "date_hardy":"Том Харди",
        })
    }

    async dateButton(callbackQuery){
        const query = callbackQuery.data;
        await this.sendImage(query)
        await this.sendText("Отличный выбор. Пригласи звезду на свидание за пять сообщений:")
        const prompt = this.loadPrompt(query);
        chatgpt.setPrompt(prompt)
    }

    async dateDialog(msg){
        const text = msg.text;
        const myMessage = await this.sendText("Ваш партнер набирает сообщение...")
        const answer = await chatgpt.addMessage(text);
        await this.editText(myMessage, answer)
    }
    async message(msg){
        this.mode = "message";
        await this.sendImage("message")
        const text = this.loadMessage("message");
        await this.sendText(`${text}`)
        await this.sendTextButtons("Список доступных возможностей:",{
            "message_date":"Пригласить на свидание",
            "message_next":"Следующее сообщение",
        })

    }
    async messageDialog(msg){
        const text = msg.text;
        this.list.push(text)
    }

    async messageButton(callbackQuery){
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query);
        const userChatHistory = this.list.join("\n\n");
        const myMessage = await this.sendText("ChatGPT думает над вариантами ответа...")
        const answer = await chatgpt.sendQuestion(prompt, userChatHistory)
        await this.editText(myMessage, answer)
        await this.sendTextButtons("Очистить историю сообщений?",{
            "clear_message":"Да, очистить.",
        })
    }
    async clear(){
        console.log(this.list)
        this.list = [];
        console.log(this.list)
        await this.sendText("Ваша переписка очищена.")
    }

    async hello(msg){
        if (this.mode === "gpt")
            await this.gptDialog(msg)
        else if(this.mode === "date")
            await this.dateDialog(msg)
        else if(this.mode === "message")
            await this.messageDialog(msg)
        else{
            const text = msg.text;
            await this.sendText("<b>Привет!</b>")
            await this.sendText("<i>Как дела?</i>")
            await this.sendText(`Вы писали: ${text}`)
            await this.sendImage("avatar_main")
            await this.sendTextButtons("Какая у вас тема в ТГ?",{
                "theme_light":"светлая",
                "theme_dark":"темная",
            })
        }
    }

    async helloButton(callbackQuery){
        const query = callbackQuery.data;
        if (query === "theme_light")
            await this.sendText("У вас светлая тема")
        else if (query === "theme_dark")
            await this.sendText("У вас темная тема")
    }
}

const chatgpt = new ChatGptService("gpt:h4CQINi3RUNETJprJI4HJFkblB3TYAWTNapKtwbtLBVoSgEz")
const bot = new MyTelegramBot("6702043005:AAERdHw5foeBKuBxFoclc73mtvBqD2tWGtU");

bot.onCommand(/\/start/ , bot.start)
bot.onCommand(/\/date/ , bot.date)
bot.onCommand(/\/message/ , bot.message)
bot.onCommand(/\/gpt/ , bot.gpt)
bot.onCommand(/\/html/ , bot.html)

bot.onTextMessage(bot.hello)
bot.onButtonCallback( /^clear_.*/ , bot.clear)
bot.onButtonCallback( /^date_.*/ , bot.dateButton )
bot.onButtonCallback( /^message_.*/ , bot.messageButton )
bot.onButtonCallback( /^.*/ , bot.helloButton )
