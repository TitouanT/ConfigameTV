const { app, BrowserWindow } = require('electron')

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

function createWindow () {
	const win = new BrowserWindow({
		width: 600,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		},
		frame: false,
	})

	win.loadFile('window/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
