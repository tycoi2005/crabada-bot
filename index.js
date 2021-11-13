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
const tus_contract = process.env.TUS_TOKEN_CONTRACT;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Create our number formatter.
const number_formatter = new Intl.NumberFormat('en-US', {
  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

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

// Matches "/tusprice [whatever]"
bot.onText(/\/tusprice/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const token = ticker;
  const token_contract = tus_contract;
  // log
  console.log("command tusprice on chat id:", chatId, ". contract:", token_contract)
  try{
    let wavax_price = 1;
    price.getPrice(WAVAX_ADDRESS).then(rs=>{
      wavax_price = rs;
      return price.getPrice(token_contract);
    }).then((token_price)=>{
        let token_pricewavax = token_price/wavax_price;
        let price_usd = parseFloat(Web3Candies.fmt18(token_price)).toFixed(Config.digits);
        let price_avax = token_pricewavax.toFixed(Config.digits);

        let msg_string = "$TUS: $" + price_usd +"\n" + price_avax+" $TUS/$AVAX";

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
    let msg_string = null;
    let price_usd = 1;
    let max_supply = 1000000000;
    price.getPrice(token_contract).then((rs)=>{
        price_usd = parseFloat(Web3Candies.fmt18(rs)).toFixed(Config.digits);
        let market_cap = max_supply * price_usd;
        let full_diluted_market_cap = max_supply * price_usd;
        msg_string = "$CRA: $" + price_usd 
                          + "\nMarket Cap: $" + number_formatter.format(market_cap) 
                          + "\nTotal Supply: " + number_formatter.format(max_supply)
        if(!pairAddress) return {reserveToken0:0, reserveToken1:0};
        return price.getReserves(token_contract,token2_contract, pairAddress)
      }).then(rs=>{
        token_balance = rs.reserveToken0;
        let balance_value = (token_balance * price_usd * 2/1e18).toFixed(Config.digits);
        msg_string += "\nJoe Liquidity: $" + number_formatter.format(balance_value);
        bot.sendMessage(chatId, msg_string);
      })
  } catch (error) {
    console.log(error)
  }
  // send back the matched "whatever" to the chat
  
});