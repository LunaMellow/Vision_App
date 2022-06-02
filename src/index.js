const { app, BrowserWindow, TouchBar} = require('electron');
const path = require('path');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true,
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    resizable: true,
    frame: true,
    width: 1150,
    height: 700,
    minHeight: 700,
    minWidth: 1150,
  });

  mainWindow.setTouchBar(touchBar)
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// const menuSlots = new TouchBarButton({
//   label: '🎰 Slots',
//   backgroundColor: '#7851A9',
//   click: () => {
//     slots()
//   }
// })

// const touchBar = new TouchBar({
//   items: [
//     menuSlots,
//     new TouchBarSpacer({ size: 'small' })
//   ]
// })

// // Start slots
//  function slots() {
//    console.log("Function is not finished")
//  }
  let spinning = false

  // Reel labels
  const reel1 = new TouchBarLabel()
  const reel2 = new TouchBarLabel()
  const reel3 = new TouchBarLabel()

  // Score labels
  const jackpots = new TouchBarLabel()
  const wins = new TouchBarLabel()
  const losses = new TouchBarLabel()

  // Dash variables
  const dash1 = new TouchBarLabel()
  const dash2 = new TouchBarLabel()
  const dash3 = new TouchBarLabel()

  // Stat variables
  var win = 0
  var lose = 0
  var jackpot = 0

  // Stats
  jackpots.label = 'Jackpots: 0'
  wins.label = 'Wins: 0'
  losses.label = 'Losses: 0'

  // Dashes
  dash1.label = '|'
  dash1.textColor = '#7851A9'
  dash2.label = '|'
  dash2.textColor = '#7851A9'
  dash3.label = '|'
  dash3.textColor = '#7851A9'

  // Reels
  reel1.label = '      '
  reel2.label = '     '
  reel3.label = '     '

  // Spin result label
  const result = new TouchBarLabel()

  // Spin button
  const spin = new TouchBarButton({
    label: '🎰 Spin',
    backgroundColor: '#7851A9',
    click: () => {
      // Ignore clicks if already spinning
      if (spinning) {
        return
      }

      spinning = true
      result.label = ''

      let timeout = 10
      const spinLength = 4 * 1000 // 4 seconds
      const startTime = Date.now()

      const spinReels = () => {
        updateReels()

        if ((Date.now() - startTime) >= spinLength) {
          finishSpin()
        } else {
          // Slow down a bit on each spin
          timeout *= 1.1
          setTimeout(spinReels, timeout)
        }
      }

      spinReels()
    }
  })

  const getRandomValue = () => {
    const values = ['🍒', '💎', '7️⃣', '🍊', '🔔', '⭐', '🍇', '🍀']
    return values[Math.floor(Math.random() * values.length)]
  }

  const updateReels = () => {
    reel1.label = getRandomValue()
    reel2.label = getRandomValue()
    reel3.label = getRandomValue()
  }

  const finishSpin = () => {
    const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
    if (uniqueValues === 1) {
      // All 3 values are the same
      jackpot = jackpot + 1
      jackpots.label = 'Jackpots: ' + jackpot
      jackpots.textColor = '#FDFF00'

      result.label = '💰 Jackpot!'
      result.textColor = '#FDFF00'

    } else if (uniqueValues === 2) {
      // 2 values are the same
      win = win + 1
      wins.label = 'Wins: ' + win
      wins.textColor = '#FFF'

      result.label = '😍 Winner!'
      result.textColor = '#FDFF00'
    } else {
      // No values are the same
      lose = lose + 1
      losses.label = 'Losses: ' + lose
      losses.textColor = '#FFF'

      result.label = '🙁 Spin Again'
      result.textColor = null
    }
    spinning = false
  }

  touchBar = new TouchBar({
    items: [
      spin,
      new TouchBarSpacer({ size: 'small' }),
      dash1,
      new TouchBarSpacer({ size: 'small'}),
      jackpots,
      new TouchBarSpacer({ size: 'small' }),
      wins,
      new TouchBarSpacer({ size: 'small'}),
      losses,
      new TouchBarSpacer({ size: 'small' }),
      dash2,
      new TouchBarSpacer({ size: 'medium'}),
      reel1,
      new TouchBarSpacer({ size: 'small' }),
      reel2,
      new TouchBarSpacer({ size: 'small' }),
      reel3,
      new TouchBarSpacer({ size: 'medium' }),
      dash3,
      new TouchBarSpacer({ size: 'small' }),
      result,
      new TouchBarSpacer({ size: 'large' })
    ]
  })

  function sleep(milliseconds) {
		const date = Date.now();
		let currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	}