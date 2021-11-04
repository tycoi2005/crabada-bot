const TelegramBot = require('node-telegram-bot-api');
const Config = require('./config');
// joe-api utils
const noop = require('joe-api/api/noop');
const supply = require('joe-api/api/supply');
const nftHat = require('joe-api/api/nft/hat');
const price = require('joe-api/api/price');
const bankerJoe = require('joe-api/api/bankerjoe');
const Web3Candies = require("@defi.org/web3-candies");
const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const ticker = process.env.TOKEN_TICKER;
const contract = process.env.TOKEN_CONTRACT;
const pairAddress = process.env.LIQUIDITY_CONTRACT;
const token2_contract = process.env.TOKEN2_CONTRACT;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  // log
  console.log("command echo on chat id:", chatId, ". data:", resp)
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Matches "/help [whatever]"
bot.onText(/\/help/, (msg) => {
  // 'msg' is the received Message from Telegram
  // of the message

  const chatId = msg.chat.id;
  // log
  console.log("command help on chat id:", chatId)
  
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, Config.helpstring);
});

// Matches "/website|twitter|discord|docs|contracts|tokenomics [whatever]"
bot.onText(/\/(website|twitter|discord|docs|contracts|tokenomics)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the command
  // log
  console.log("command url on chat id:", chatId, "match", match)
  
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, Config[resp]);
});

// Matches "/crabemo [whatever]"
bot.onText(/\/crabemo/, (msg) => {
  // 'msg' is the received Message from Telegram
  // of the message

  const chatId = msg.chat.id;
  // log
  console.log("command crabemo on chat id:", chatId)
  
  // send back the matched "whatever" to the chat
  sticker = Config.stickers[Math.floor(Math.random()*Config.stickers.length)];
  bot.sendSticker(chatId, sticker);
});

// Matches "/price [whatever]"
bot.onText(/\/price/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const token = ticker;
  const token_contract = contract;
  // log
  console.log("command price on chat id:", chatId, ". contract:", token_contract)
  try{
    let wavax_price = 1;
    price.getPrice(WAVAX_ADDRESS).then(rs=>{
      wavax_price = rs;
      return price.getPrice(token_contract);
    }).then((token_price)=>{
        let token_pricewavax = token_price/wavax_price;
        let price_usd = parseFloat(Web3Candies.fmt18(token_price)).toFixed(Config.digits);
        let price_avax = token_pricewavax.toFixed(Config.digits);

        let msg_string = "$CRA: $" + price_usd +"\n" + price_avax+" $CRA/$AVAX";

        bot.sendMessage(chatId, msg_string);
      })
  } catch (error) {
    console.log(error)
  }
  // send back the matched "whatever" to the chat
  
});

// Matches "/about [whatever]"
bot.onText(/\/about/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const token = ticker;
  const token_contract = contract;
  // log
  console.log("command about on chat id:", chatId, ". contract:", token_contract)
  try{
    let circ_supply = -1;
    let token_balance = 0;
    price.getReserves(token_contract,token2_contract, pairAddress).then(rs=>{
      token_balance = rs.reserveToken0;
      return supply.getMaxSupply(token_contract);
    }).then(rs=>{
      max_supply = parseFloat(Web3Candies.fmt18(rs)).toFixed(Config.digits);
      return supply.getCirculatingSupply(token_contract);
    }).then(rs=>{
      circ_supply = parseFloat(Web3Candies.fmt18(rs)).toFixed(Config.digits);
      return price.getPrice(token_contract);
    }).then((rs)=>{
        let price_usd = parseFloat(Web3Candies.fmt18(rs)).toFixed(Config.digits);
        let balance_value = (token_balance * price_usd * 2/1e18).toFixed(Config.digits);
        let market_cap = circ_supply * price_usd;
        let full_diluted_market_cap = max_supply * price_usd;
        let msg_string = "$CRA: $" + price_usd 
                          + "\nMarket Cap: $" + market_cap
                          + "\nFully Diluted Market Cap: $" + full_diluted_market_cap
                          + "\nCirc. Supply: " + circ_supply
                          + "\nMax Supply: " + max_supply
                          + "\nJoe Liquidity: $" + balance_value;
        bot.sendMessage(chatId, msg_string);
      })
  } catch (error) {
    console.log(error)
  }
  // send back the matched "whatever" to the chat
  
});

// Listen for any kind of message. There are different kinds of
// messages.

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   console.log("sticker", msg.sticker?.file_id)
//   bot.sendMessage(chatId, 'Received your msg:', msg);
// });