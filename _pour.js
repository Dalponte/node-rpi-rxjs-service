const { interval, fromEvent } = require('rxjs')
const { map, filter } = require('rxjs/operators')
const events = require('events')
const gpio = require('rpi-gpio')
const gpioPromise = require('rpi-gpio').promise

const PourProvider = require('./PourProvider')
const { mockEvent } = require('./mock')
interval(1000).subscribe((t) => {console.log('t: ', t)})

const consumption = {
    "meta": null,
    "id": 1067,
    "limitAmount": 50,
    "createdAt": "2020-05-25T13:24:45.269532+00:00",
    "consumption_order": {}
}

const provider = new PourProvider(
    () => fromEvent(gpio, 'change'),
    gpioPromise,
    {
        flowPulseFactor: 0.146,
        timeoutTime: 15000,
        debounceTime: 8000,
    }
)
const ipcMain = new events.EventEmitter()
ipcMain.on('AUTHENTICATED', provider.consumptionHandler)

provider.setup().then(async() => {
    ipcMain.emit('AUTHENTICATED', mockEvent, consumption)
})
interval(20000).subscribe((t) => {
    ipcMain.emit('AUTHENTICATED', mockEvent, { ...consumption, id: t + 1 })
})
