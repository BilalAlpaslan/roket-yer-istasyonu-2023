const { app, BrowserWindow, ipcMain } = require('electron')
const { SerialPort } = require('serialport')
const fs = require('fs');


let mainWindow
let portWindow

let mainSerialPort = null
let payloadSerialPort = null
let HyiSerialPort = null

const createWindow = () => {
    mainWindow = new BrowserWindow({
        icon: __dirname + '/src/logo.ico',
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })
    mainWindow.loadFile('src/index.html')
}

const createPortWindow = () => {
    portWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        parent: mainWindow,
        modal: true,
    })
    portWindow.loadFile('src/port.html')
}

app.on('ready', () => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('port-window-open', () => {createPortWindow()})
ipcMain.on('port-window-close', () => {portWindow.close()})


function saveLog(file,data){
    if(file=='main.csv')
        fs.appendFile(file,(data).replace(/,/g,';') , 'utf8', (err) =>{})
    else
        fs.appendFile(file,(data + '\n').replace(/,/g,';') , 'utf8', (err) =>{})
}

function byteToFloat(bytes) {
    // bytes is an array of 4 bytes, eg [0x44, 0x6F, 0x33, 0x33] and uses little endian
    const bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    const sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    const e = bits >>> 23 & 0xff;
    const m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    const f = sign * m * Math.pow(2, e - 150);
    return f;
}

ipcMain.on('connect', (event, port, baudRate, portName) => {
    if (portName == "main") {
        mainSerialPort = new SerialPort({
            baudRate: Number(baudRate),
            autoOpen: false,
            path: port,
        });
        mainSerialPort.open();

        mainSerialPort.on('open', () => {
            mainWindow.webContents.send('connection-opened', port);
        });

        let buffer = ''

        mainSerialPort.on('data', (data) => {
            buffer = buffer + data.toString();
            if (buffer.indexOf('\r\n') !== -1) {
                console.log('data: ',buffer.toString());
                mainWindow.webContents.send('data-received', buffer.toString())
                saveLog('main.csv', buffer)
                buffer = ''
            }
        });

        mainSerialPort.on('error', (err) => {
            console.log(err);
            mainWindow.webContents.send('connection-error', err);
        });

        mainSerialPort.on('close', () => {
            mainWindow.webContents.send('connection-closed');
        });
    } else if (portName == "payload") {
        payloadSerialPort = new SerialPort({
            baudRate: Number(baudRate),
            autoOpen: false,
            path: port,
        });
        payloadSerialPort.open();

        payloadSerialPort.on('open', () => {
            mainWindow.webContents.send('connection-opened', port);
        });

        let buffer2 = Buffer.alloc(0);
        const start_buffer = Buffer.from([0xFF, 0xFF, 0x54, 0x52]);
        const finish_buffer = Buffer.from([0x0D, 0x0A]);

        payloadSerialPort.on('data', (data) => {
            buffer2 = Buffer.concat([buffer2, data]);

            console.log(1)

            if (buffer2.indexOf(start_buffer) !== -1) {
                buffer2 = buffer2.slice(buffer2.indexOf(start_buffer));
            }

            if (buffer2.indexOf(finish_buffer) !== -1) {
                const temp = buffer2.slice(32)
                buffer2 = buffer2.slice(0, 32);
                if(buffer2[30] == 0x0D && buffer2[31] == 0x0A){
                    console.log('data: ',buffer2);

                    const payload_datas = [0,0,0,0,0,0]

                    payload_datas[0] = byteToFloat([buffer2[5], buffer2[6], buffer2[7], buffer2[8]]).toFixed(4)
                    payload_datas[1] = byteToFloat([buffer2[9], buffer2[10], buffer2[11], buffer2[12]]).toFixed(4)
                    payload_datas[2] = byteToFloat([buffer2[13], buffer2[14], buffer2[15], buffer2[16]]).toFixed(4)
                    payload_datas[3] = byteToFloat([buffer2[17], buffer2[18], buffer2[19], buffer2[20]]).toFixed(4)
                    payload_datas[4] = byteToFloat([buffer2[21], buffer2[22], buffer2[23], buffer2[24]]).toFixed(4)
                    payload_datas[5] = byteToFloat([buffer2[25], buffer2[26], buffer2[27], buffer2[28]]).toFixed(4)
                    mainWindow.webContents.send('data-received-payload', payload_datas)
                    saveLog('payload.csv', payload_datas.toString())
                }
                buffer2 = temp
            }
        });

        payloadSerialPort.on('error', (err) => {
            console.log(err);
            mainWindow.webContents.send('connection-error', err);
        });

        payloadSerialPort.on('close', () => {
            mainWindow.webContents.send('connection-closed');
        });
    } else if (portName == "hyi") {
        HyiSerialPort = new SerialPort({
            baudRate: Number(baudRate),
            autoOpen: false,
            path: port,
        });
        HyiSerialPort.open();

        HyiSerialPort.on('open', () => {
            console.log("Connection opened HYI");
            mainWindow.webContents.send('connection-opened', port);
        });

        HyiSerialPort.on('error', (err) => {
            console.log(err);
            mainWindow.webContents.send('connection-error', err);
            HyiSerialPort = null;
        });

        HyiSerialPort.on('close', () => {
            mainWindow.webContents.send('connection-closed');
            HyiSerialPort = null;
        });
    } else {
        console.log("Error: No port name specified" + portName);
    }
});

ipcMain.on('refresh-port-list', (event) => {
    SerialPort.list().then(ports => {
        portWindow.webContents.send('port-list', ports);
    });
});

ipcMain.on('send-hyi', (event, data) => {
    if (HyiSerialPort != null) {
        if(HyiSerialPort.isOpen){
            console.log("Sending: " + data);
            HyiSerialPort.write(data);
        }
        else
            console.log("Error: Port is not open");
    } else {
        console.log("Error: No port selected");
    }
});
