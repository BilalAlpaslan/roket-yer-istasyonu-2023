const { ipcRenderer } = require('electron');

const refreshBtn = document.getElementById('refresh-btn');

const mainPortSelect = document.getElementById('port-select-main');
const mainBaudRateSelect = document.getElementById('baud-rate-select-main');

const payloadPortSelect = document.getElementById('port-select-payload');
const payloadBaudRateSelect = document.getElementById('baud-rate-select-payload');

const HyiPortSelect = document.getElementById('port-select-hyi');
const HyiBaudRateSelect = document.getElementById('baud-rate-select-hyi');

function updatePortList(ports) {
    mainPortSelect.innerHTML = '';
    payloadPortSelect.innerHTML = '';
    HyiPortSelect.innerHTML = '';

    ports.forEach(port => {
        const portOption = document.createElement('option');
        portOption.value = port.path;
        portOption.text = `${port.path} (${port.manufacturer})`;

        // copy the option to all port selects
        mainPortSelect.appendChild(portOption.cloneNode(true));
        payloadPortSelect.appendChild(portOption.cloneNode(true));
        HyiPortSelect.appendChild(portOption.cloneNode(true));
    });
}

refreshBtn.addEventListener('click', () => {
    ipcRenderer.send('refresh-port-list');
});

// Başlangıçta port listesini güncelle
ipcRenderer.send('refresh-port-list');
ipcRenderer.on('port-list', (event, ports) => {
    updatePortList(ports);
});

ipcRenderer.on('connection-opened', (event, port) => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = `${port} portuna bağlandınız.`;
});

ipcRenderer.on('data-received', (event, data) => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = `Veri alındı: ${data}`;
});

ipcRenderer.on('connection-error', (event, err) => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = `Hata: ${err.message}`;
});

// Bağlantı formunu gönderme işlemi
const connectFormMain = document.getElementById('connect-form-main');
const connectFormPayload = document.getElementById('connect-form-payload');
const connectFormHyi = document.getElementById('connect-form-hyi');

connectFormMain.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedPort = mainPortSelect.value;
    const selectedBaudRate = mainBaudRateSelect.value;
    ipcRenderer.send('connect', selectedPort, selectedBaudRate, 'main');
});

connectFormPayload.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedPort = payloadPortSelect.value;
    const selectedBaudRate = payloadBaudRateSelect.value;
    ipcRenderer.send('connect', selectedPort, selectedBaudRate, 'payload');
});

connectFormHyi.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedPort = HyiPortSelect.value;
    const selectedBaudRate = HyiBaudRateSelect.value;
    ipcRenderer.send('connect', selectedPort, selectedBaudRate, 'hyi');
});

