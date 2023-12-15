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

//trip model
const Trip = require('./Models/trip.model')

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
        bot.telegram.sendMessage(ctx.chat.id, 'Welcome to create trip, Please select destination 📚', {
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
    (ctx) => {
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
            bot.telegram.sendMessage(ctx.chat.id, 'Next, select departure time', {
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
    (ctx) => {
        if (ctx.updateType != 'callback_query') {
            if (ctx.update.message.text) {
                if (ctx.update.message.text == '/cancel') {
                    //leave scene
                    ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
                    return ctx.scene.leave();
                }
            }

            bot.telegram.sendMessage(ctx.chat.id, 'Next, select departure time', {
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
            ctx.wizard.state.trip.departureTime = ctx.update.callback_query.data
            ctx.reply('Please enter date')
            return ctx.wizard.next()
        }

    },
    (ctx) => {
        if (ctx.message.text.toLowerCase() == '/cancel') {
            ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
            return ctx.scene.leave();
        }

        const date = ctx.message.text
        ctx.wizard.state.trip.date = date
        bot.telegram.sendMessage(ctx.chat.id, 'Next, Select Vehicle Type', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'High Roof', callback_data: 'High Roof' }],
                    [{ text: 'Private Vehicles', callback_data: 'Private Vehicles' }],
                ]
            }
        })

        return ctx.wizard.next()
    },
    (ctx) => {
        if (ctx.updateType != 'callback_query') {
            if (ctx.update.message.text) {
                if (ctx.update.message.text == '/cancel') {
                    //leave scene
                    ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
                    return ctx.scene.leave();
                }
            }
            ctx.reply('Please enter the correct Information 👍');
            bot.telegram.sendMessage(ctx.chat.id, 'Next, Vehicle Type', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'High Roof', callback_data: 'High Roof' }],
                        [{ text: 'Private Vehicles', callback_data: 'Private Vehicles' }],
                    ]
                }
            })

            return
        }
        else {
            ctx.answerCbQuery()
            ctx.wizard.state.trip.vehicleType = ctx.update.callback_query.data
            ctx.reply(`Great , Next input price ` )
            return ctx.wizard.next()
        }
    },
    (ctx) => {
        if (ctx.message.text.toLowerCase() == '/cancel') {
            ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
            return ctx.scene.leave();
        }
        const price = ctx.message.text
        ctx.wizard.state.trip.price = price
        const message = `Confirm trip data

        Destination : ${ctx.wizard.state.trip.destination}
        Date : ${ctx.wizard.state.trip.date}
        Departure Time : ${ctx.wizard.state.trip.departureTime}
        Vehicle Type : ${ctx.wizard.state.trip.vehicleType}
        Price : ${ctx.wizard.state.trip.price}

       `
       bot.telegram.sendMessage(ctx.chat.id, message, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Cancel', callback_data: 'cancel' },
                    { text: 'Confirm', callback_data: 'confirm' },

                ],
            ]
        }
    })
        return ctx.wizard.next()
    },
    (ctx) =>{
        if (ctx.updateType != 'callback_query') {
            if (ctx.update.message.text) {
                if (ctx.update.message.text == '/cancel') {
                    //leave scene
                    ctx.reply('Process terminated \n\nplease use the /start command to start using our service ');
                    return ctx.scene.leave();
                }
            }

            ctx.reply('Please enter the correct Information 👍');
            bot.telegram.sendMessage(ctx.chat.id, message, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Cancel', callback_data: 'cancel' },
                            { text: 'Confirm', callback_data: 'confirm' },

                        ],
                    ]
                }
            })

            return
        }
        else if (ctx.update.callback_query.data == 'confirm') {
            ctx.answerCbQuery()
            // save data to database
            const tripData = ctx.wizard.state.trip
            // send user data to database
            const newTrip = new Trip(tripData)
            newTrip.save()
                .then(savedTrip => {
                    console.log('Trip saved to database:', savedTrip);
                    ctx.reply(`Congratulation, you have created a new trip 🎉 , Use /start to do other operation`);
                })
                .catch(error => {
                    console.error('Error saving trip:', error);
                    console.log('trip', tripData);
                    ctx.reply('Oops! There was an error processing your trip creation.');
                });
            return ctx.scene.leave()
        }
        else{
            ctx.reply('Process terminated \n\nplease use the /start command to start using our service\n\n Join our telegram channel @WeGo_Ride ');
            return ctx.scene.leave();
        }
    }

)

//scenes

const stage = new Stage()
stage.register(createTripScene)
bot.use(stage.middleware())

bot.command('createTrip', (ctx) => {
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
