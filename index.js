const { app, BrowserView, BrowserWindow } = require('electron');
const appConfig = require('electron-settings');

function windowStateKeeper(windowName) {
    let window, windowState;

    //Applies saved window state to window on startup if one exists else creates one.
    function setBounds() {
        if (appConfig.has(`windowState.${windowName}`)) {
            windowState = appConfig.get(`windowState.${windowName}`);
        } else {
            windowState = {
                x: undefined,
                y: undefined,
                width: 1000,
                height: 800
            };
        }
    }
    //Saves window state(height, width, position) so that the app opens to its previous dimensions.
    function saveState() {
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        appConfig.set(`windowState.${windowName}`, windowState);
    }
    //Creates event handlers for all user window adjustments
    function track(win) {
        window = win;
        ['resize', 'move', 'close'].forEach(event => {
            win.on(event, saveState)
        })
    }

    setBounds();

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
        title: 'Messages',
        x: mainWindowStateKeeper.x,
        y: mainWindowStateKeeper.y,
        width: mainWindowStateKeeper.width,
        height: mainWindowStateKeeper.height
    }
    
    //Primary app window
    let window = new BrowserWindow(windowOptions);

    mainWindowStateKeeper.track(window);

    window.on('closed', () => {
        window = null
    })

    //View that hosts messages web app
    let view = new BrowserView({
        webPreferences: {
            nodeIntegration: false
        }
    });
    view.setAutoResize({width:true, height: true});
    window.setBrowserView(view);
    view.setBounds({
        x: 0, y: 0,
        width: windowOptions.width, height: windowOptions.height - 39
    })
    //Load in messages app
    view.webContents.loadURL('https://messages.android.com');
}

app.setLoginItemSettings({
	openAtLogin: true
});

//Render window when app is ready
app.on('ready', createWindow);
//Terminates all processes if all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
});