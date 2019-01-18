const { app, BrowserView, BrowserWindow } = require('electron')
const appConfig = require('electron-settings')

function windowStateKeeper(windowName) {
    let window, windowState

    function setBounds() {
        if (appConfig.has(`windowState.${windowName}`)) {
            windowState = appConfig.get(`windowState.${windowName}`)
        } else {
            windowState = {
                x: undefined,
                y: undefined,
                width: 1000,
                height: 800
            }
        }
    }

    function saveState() {
        if (!windowState.isMaximized) {
            windowState = window.getBounds()
        }
        windowState.isMaximized = window.isMaximized()
        appConfig.set(`windowState.${windowName}`, windowState)
    }

    function track(win) {
        window = win;
        ['resize', 'move', 'close'].forEach(event => {
            win.on(event, saveState)
        })
    }

    setBounds()

    return {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track
    }
}

function createWindow() {
    const mainWindowStateKeeper = windowStateKeeper('main')

    const windowOptions = {
        title: 'Google Messages',
        x: mainWindowStateKeeper.x,
        y: mainWindowStateKeeper.y,
        width: mainWindowStateKeeper.width,
        height: mainWindowStateKeeper.height
    }
    
    //let window = new BrowserWindow(windowStateKeeper('main'))
    let window = new BrowserWindow(windowOptions)

    mainWindowStateKeeper.track(window)

    //let window = new BrowserWindow({ width: 1600, height: 900 })

    //window.webContents.openDevTools()

    window.on('closed', () => {
        window = null
    })

    //window.loadFile('index.html')

    let view = new BrowserView({
        webPreferences: {
            nodeIntegration: false
        }
    })
    view.setAutoResize({width:true, height: true})

    window.setBrowserView(view)
    view.setBounds({
        x: 0, y: 0,
        width: windowOptions.width, height: windowOptions.height
    })
    view.webContents.loadURL('https://messages.android.com')
    //view.webContents.openDevTools()
    //view.webContents. //inject = require('./script.js')
}

app.on('ready', createWindow)