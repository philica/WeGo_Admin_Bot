require('dotenv').config()

const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const mongoose = require('mongoose')
const { enter, leave } = Stage
const connectDB = require('./db')
const express = require('express')

const app = express()
app.get('/', (req, res) => {
    res.send("This is WeGo bot")
    console.log('I am up and running')
})

app.listen(3000, () => {
    console.log('I am up and running')
})

// create database connection
connectDB();

const bot = new Telegraf('6438462191:AAEWyZMbIl-Nk1aQX4bUKsLgk0oiYjyFP6o')
bot.use(session())

console.log('Bot has been started ...')


//scenes 
const createTripScene = new WizardScene(
    'createTripScene',
    (ctx) => {
        ctx.reply("welcome to create trip")
        bot.telegram.sendMessage(ctx.chat.id, 'Please select destination 📚', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Megenagna', callback_data: 'Megenagna' }],
                    [{ text: 'AutobusTera', callback_data: 'AutobusTera' }],
                    [{ text: 'Kality', callback_data: 'Kality' }],
                    [{ text: 'AyerTena', callback_data: 'AyerTena' }]
                ]
            }
        })
        ctx.wizard.state.trip = {};
        return ctx.wizard.next()
    },
    (ctx)=>{
        if (ctx.updateType != 'callback_query') {
            if (ctx.update.message.text) {
                if (ctx.update.message.text == '/cancel') {
                    //leave scene
                    ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
                    return ctx.scene.leave();
                }
            }

            bot.telegram.sendMessage(ctx.chat.id, 'Please select destination 📚', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Megenagna', callback_data: 'Megenagna' }],
                        [{ text: 'AutobusTera', callback_data: 'AutobusTera' }],
                        [{ text: 'Kality', callback_data: 'Kality' }],
                        [{ text: 'AyerTena', callback_data: 'AyerTena' }]
                    ]
                }
            })

            return
        }
        else {
            ctx.answerCbQuery()
            ctx.wizard.state.trip.destination = ctx.update.callback_query.data
            bot.telegram.sendMessage(ctx.chat.id, 'Next, select relevant time', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '2:00', callback_data: '2:00' }],
                        [{ text: '4:00', callback_data: '4:00' }],
                        [{ text: '8:00', callback_data: '8:00' }],
                        [{ text: '10:00', callback_data: '10:00' }],
                        [{ text: '11:00', callback_data: '11:00' }]
                    ]
                }
            })
            return ctx.wizard.next()
        }

    },
    (ctx)=>{
        if (ctx.updateType != 'callback_query') {
            if (ctx.update.message.text) {
                if (ctx.update.message.text == '/cancel') {
                    //leave scene
                    ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
                    return ctx.scene.leave();
                }
            }

            bot.telegram.sendMessage(ctx.chat.id, 'Next, select relevant time', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '2:00', callback_data: '2:00' }],
                        [{ text: '4:00', callback_data: '4:00' }],
                        [{ text: '8:00', callback_data: '8:00' }],
                        [{ text: '10:00', callback_data: '10:00' }],
                        [{ text: '11:00', callback_data: '11:00' }]
                    ]
                }
            })

            return
        }
        else {
            ctx.answerCbQuery()
            ctx.wizard.state.trip.time = ctx.update.callback_query.data

            // date time picker
            var hideTimeButton = {
                text: 'only date',
                web_app: {
                    url: 'https://expented.github.io/tgdtp/?hide=time'
                }
            }
            var print = 'Choose relevant date'
        
            ctx.reply(print, {
                reply_markup: JSON.stringify({
                    resize_keyboard: true,
                    keyboard: [
                        [ hideTimeButton ]
                    ]
                })
            })
            return ctx.wizard.next()
        }

    },
    (ctx) => {
        
    }


//scenes

const stage = new Stage()
stage.register(createTripScene)
bot.use(stage.middleware())

bot.command('createTrip',(ctx)=>{
    ctx.scene.enter('createTripScene')
})

bot.start((ctx) => {
    ctx.reply('Welcome to WeGo Admin bot ')

})


bot.launch();


module.exports = bot;
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
