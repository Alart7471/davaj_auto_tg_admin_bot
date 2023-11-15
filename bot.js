const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '************************';


const bot = new TelegramBot(token, {polling: true});


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`${msg.chat.first_name}:${chatId}`)

  const messageKeys = {
    inline_keyboard: [
      [{ text: 'Получить заявки', callback_data: 'menu_clients' }],
      [{ text: 'Меню', callback_data: 'menu_menu' }]
    ]
  };
  
  const chatKeys = {
    keyboard: [['Получить список клиентов']],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  let t = new Date()
  let ft = t.toLocaleString();

  bot.sendMessage(chatId, `Davaj Davaj!\nНачнем работу!\n\nТекущее время: ${ft}`, { reply_markup: messageKeys });
  bot.sendMessage(chatId, 'Чтобы получить список клиентов отправьте:\nПолучить список клиентов', { reply_markup: chatKeys });
  delete t, ft
});

// Обработчик кнопки "Получить список клиентов"
bot.onText(/Получить список клиентов/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Получить заявки', callback_data: 'menu_clients' }],
        [{ text: 'Главное меню', callback_data: 'menu_menu' }]
      ]
    }
  };
  
  
  // Отправка HTTP GET запроса на сервер
  axios.get('http://davaj.arcerdo.site/api/*')
    .then((response) => {
      // Фильтрация данных из ответа сервера

    //console.log(response.data)
        var data = response.data
        for(let i = 0; i < data.length; i++){
          console.log(data[i])
        }



      const filteredData = response.data.filter((item) => {
          //Добавить фильтр
        return item
      });
      
      // Формирование сообщения с отфильтрованными данными
      let message = 'Список клиентов:\n';
      filteredData.forEach((item) => {
        let toAdd = `ID: ${item.id}\n- ${item.name}\nСообщение:\n${item.message}\nКонтакт:\n${item.contact}\n`;
        if(message.length+toAdd.length > 4095){
            
            return

        }
        message += toAdd;
        message+= '\n'
        
      });
      
      
      bot.sendMessage(chatId, message, keyboard);
    })
    .catch((error) => {
        console.log(error)
      bot.sendMessage(chatId, 'Произошла ошибка при получении списка клиентов.');
    });

});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const buttonClicked = query.data;
    console.log(query.data)
  
    // Обработка нажатия на кнопку
    switch (buttonClicked) {
      case 'menu_clients':
        // Открыть информацию по выбранному клиенту
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Получить заявки', callback_data: 'menu_clients' }],
              [{ text: 'Главное меню', callback_data: 'menu_menu' }]
            ]
          }
        };
        axios.get('http://davaj.arcerdo.site/api/*')
        .then((response) => {

          const filteredData = response.data.filter((item) => {
            //Добавить фильтр
            //console.log(item.message)
            // return item.someProperty === 'someValue';
            return item
          });
          
          // Формирование сообщения с отфильтрованными данными
          let message = 'Список клиентов:\n';
          let t = new Date()
          let ft = t.toLocaleString();
          message += `Дата: ${ft}\n`
          filteredData.forEach((item) => {
            let toAdd = `ID: ${item.id}\n- ${item.name}\nСообщение:\n${item.message}\nКонтакт:\n${item.contact}\n`;
            if(message.length+toAdd.length > 4095){
                
                return
    
            }
            message += toAdd;
            message+= '\n'
            
          });
          
          
          bot.sendMessage(chatId, message, keyboard);
          delete message, t, ft
        })
        .catch((error) => {
            console.log(error)
          bot.sendMessage(chatId, 'Произошла ошибка при получении списка клиентов.');
        });
        break;
      case 'menu_menu':
        // Открыть дополнительное меню
        const mkb = {
          reply_markup: {
            inline_keyboard: [
                [{ text: 'Получить заявки', callback_data: 'menu_clients' }],
                [{ text: 'Меню', callback_data: 'menu_menu' }]
            ]
          }
        };
        let t = new Date()
        let ft = t.toLocaleString();
        bot.sendMessage(chatId, `Davaj Davaj!\nНачнем работу!\n\nДата: ${ft}`,mkb)
        delete t, ft
        break;
      default:
        bot.sendMessage(chatId, 'Неизвестная кнопка');
    }
  });
