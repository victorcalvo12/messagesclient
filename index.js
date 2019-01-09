const { app, BrowserView, BrowserWindow } = require('electron')

function createWindow() {
    let window = new BrowserWindow({ width: 900, height: 900 })

    window.on('closed', () => {
        window = null
    })

    window.webContents.openDevTools()

    //window.loadFile('index.html')

    let view = new BrowserView({
        webPreferences: {
            nodeIntegration: false
        }
    })

    window.setBrowserView(view)
    view.setBounds({
        x: 0, y: 0,
        width: 900, height: 900
    })
    view.webContents.loadURL('https://messages.android.com')
}

app.on('ready', createWindow)