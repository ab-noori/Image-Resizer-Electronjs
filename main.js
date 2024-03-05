const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

// process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

// create main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
    });

    //Open devtools if in dev environment
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
      title: 'About Image Resizer',
      width: 300,
      height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}


// App is ready
app.whenReady().then(() => {
    createMainWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //Remove mainWindow from memory on close
    mainWindow.on('closed', () => mainWindow = null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

// Menu template
const menu = [
  ...(!isMac ? [
    {
      label: app.name,
      submenu: [
        {
          label: 'About',
          click: createAboutWindow,
        }
      ]
    }
  ] : []),

  {
    role: 'fileMenu',
  },
  
  ...(!isMac ? [{
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: createAboutWindow,
      }
    ]
  }] : []),
]

// Respond to ipcRenderer resize events
ipcMain.on('resize-image', (e, options) => {
  options.dest = path.join(os.homedir(), 'imagesresizer');
  resizeImage(options);
})

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height
    });

    // Create file name
    const filename = path.basename(imgPath);

    // Create dest foler if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Sennd to success to render
    mainWindow.webContents.send('image:done');

    // Open dest folder
    shell.openPath(dest);

  } catch (e) {
    console.log(e);
  }
}

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })

