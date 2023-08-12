const { ipcRenderer } = require('electron');

const portWindowBtn = document.getElementById('port-window-btn');

let loc = { lat: 40.918346, lng: 29.146423 };

function initMap() {
    let map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: loc,
    });
    let marker = new google.maps.Marker({
        position: loc,
        map: map,
    });
    setInterval(() => {
        marker.setPosition(loc);
        map.setCenter(loc);
    }, 1000);
}

window.initMap = initMap;


portWindowBtn.addEventListener('click', () => {
    ipcRenderer.send('port-window-open');
});

ipcRenderer.on('connection-closed', () => {
    portWindowBtn.innerText = 'Bağlantı yok';
    portWindowBtn.style.backgroundColor = 'red';
});

ipcRenderer.on('connection-opened', () => {
    portWindowBtn.innerText = 'Bağlantı kuruldu';
    portWindowBtn.style.backgroundColor = 'green';
});

let raw_datas = [];
let kurutma_1_datas = [];
let kurutma_2_datas = [];
let saat_datas = [];
let irtifa_datas = [];
let sicaklik_datas = [];
let basinc_datas = [];
let gyro_x_datas = [];
let gyro_y_datas = [];
let lat_datas = [];
let lon_datas = [];
let sat_datas = [];
let gps_alt_datas = [];

let payload_irtifa_datas = [];
let payload_sicaklik_datas = [];
let payload_basinc_datas = [];
let payload_nem_datas = [];
let payload_lat_datas = [];
let payload_lon_datas = [];

let terminal = document.getElementById('terminal')
let kurtarma_1 = document.getElementById('kurtarma-1')
let kurtarma_2 = document.getElementById('kurtarma-2')
let saat = document.getElementById('saat')
let irtifa = document.getElementById('irtifa')
let sicaklik = document.getElementById('sicaklik')
let basinc = document.getElementById('basinc')
let gyro_x = document.getElementById('gyro_x')
let gyro_y = document.getElementById('gyro_y')
let lat = document.getElementById('lat')
let lon = document.getElementById('lon')
let sat = document.getElementById('sat')

let payload_irtifa = document.getElementById('payload-irtifa')
let payload_sicaklik = document.getElementById('payload-sicaklik')
let payload_basinc = document.getElementById('payload-basinc')
let payload_nem = document.getElementById('payload-nem')
let payload_lat = document.getElementById('payload-lat')
let payload_lon = document.getElementById('payload-lon')

let sayac = 0;

let gps_type = "main" // main, payload
let gps_btn = document.getElementById('gps-btn')
gps_btn.addEventListener('click', () => {
    if (gps_type == "main") {
        gps_type = "payload"
        gps_btn.innerText = "Payload GPS"
    } else {
        gps_type = "main"
        gps_btn.innerText = "Main GPS"
    }
})

ipcRenderer.on('data-received', (event, data) => {
    let datas = data.split(',');
    raw_datas.push(datas);
    kurutma_1_datas.push(datas[0][0]);
    kurutma_2_datas.push(datas[0][1]);
    saat_datas.push(datas[1]);
    irtifa_datas.push(datas[2]);
    sicaklik_datas.push(datas[3]);
    basinc_datas.push(datas[4]);
    gyro_x_datas.push(datas[5]);
    gyro_y_datas.push(datas[6]);
    lat_datas.push(datas[7]);
    lon_datas.push(datas[8]);
    sat_datas.push(datas[9]);
    gps_alt_datas.push(datas[10]);


    const dummytext = "\n\n\n\n\n\n\n\n\n\n\n\n\n"

    terminal.innerText = dummytext + raw_datas
    terminal.scrollTop = terminal.scrollHeight;

    if (kurutma_1_datas[kurutma_1_datas.length - 1] == '-') {
        kurtarma_1.style.backgroundColor = 'red';
        kurtarma_1.innerText = 'Tetiklenmedi'
    } else {
        kurtarma_1.style.backgroundColor = 'green';
        kurtarma_1.innerText = 'Tetiklendi'
    }
    if (kurutma_2_datas[kurutma_2_datas.length - 1] == '-') {
        kurtarma_2.style.backgroundColor = 'red';
        kurtarma_2.innerText = 'Tetiklenmedi'
    } else {
        kurtarma_2.style.backgroundColor = 'green';
        kurtarma_2.innerText = 'Tetiklendi'
    }
    saat.innerText = saat_datas[saat_datas.length - 1];
    irtifa.innerText = irtifa_datas[irtifa_datas.length - 1] + ' m';
    sicaklik.innerText = sicaklik_datas[sicaklik_datas.length - 1] + ' °C';
    basinc.innerText = basinc_datas[basinc_datas.length - 1] + ' hPa';
    gyro_x.innerText = 'x = ' + gyro_x_datas[gyro_x_datas.length - 1];
    gyro_y.innerText = 'y = ' + gyro_y_datas[gyro_y_datas.length - 1];
    lat.innerText = 'lat = ' + lat_datas[lat_datas.length - 1];
    lon.innerText = 'lon = ' + lon_datas[lon_datas.length - 1];
    sat.innerText = 'Uydu Sayisi = ' + sat_datas[sat_datas.length - 1];

    // loc.lat = parseFloat(lat_datas[lat_datas.length - 1]);
    // loc.lng = parseFloat(lon_datas[lon_datas.length - 1]);
    if (gps_type == "main") {
        loc.lat = parseFloat(lat_datas[lat_datas.length - 1]);
        loc.lng = parseFloat(lon_datas[lon_datas.length - 1]);
    } else {
        loc.lat = parseFloat(payload_lat_datas[payload_lat_datas.length - 1]);
        loc.lng = parseFloat(payload_lon_datas[payload_lon_datas.length - 1]);
    }

    // 78 byte array
    let byte_data = convert_to_bytes(
        sayac++,
        parseFloat(irtifa_datas[irtifa_datas.length - 1]),
        parseFloat(lat_datas[lat_datas.length - 1]),
        parseFloat(lon_datas[lon_datas.length - 1]),
        parseFloat(gps_alt_datas[sicaklik_datas.length - 1]),
        parseFloat(payload_lat_datas[payload_lat_datas.length - 1]),
        parseFloat(payload_lon_datas[payload_lon_datas.length - 1]),
        parseFloat(payload_irtifa_datas[payload_irtifa_datas.length - 1]),
        parseFloat(gyro_x_datas[gyro_x_datas.length - 1]),
        parseFloat(gyro_y_datas[gyro_y_datas.length - 1]),
        0.0,
        0,
    );

    ipcRenderer.send('send-hyi', byte_data);

});

ipcRenderer.on('data-received-payload', (event, data) => {
    payload_irtifa_datas.push(data[0]);
    payload_lat_datas.push(data[1]);
    payload_lon_datas.push(data[2]);
    payload_nem_datas.push(data[3]);
    payload_sicaklik_datas.push(data[4]);
    payload_basinc_datas.push(data[5]);

    payload_irtifa.innerText = payload_irtifa_datas[payload_irtifa_datas.length - 1] + ' m';
    payload_lat.innerText = payload_lat_datas[payload_lat_datas.length - 1];
    payload_lon.innerText = payload_lon_datas[payload_lon_datas.length - 1];
    payload_nem.innerText = payload_nem_datas[payload_nem_datas.length - 1] + ' %';
    payload_sicaklik.innerText = payload_sicaklik_datas[payload_sicaklik_datas.length - 1] + ' °C';
    payload_basinc.innerText = payload_basinc_datas[payload_basinc_datas.length - 1] + ' hPa';

});


function convert_to_bytes(
    sayac = 0,
    irtifa = 0.0,
    enlem = 0.0,
    boylam = 0.0,
    gps_irtifa = 0.0,
    faydali_enlem = 0.0,
    faydali_boylam = 0.0,
    faydali_irtifa = 0.0,
    gyr_x = 0.0,
    gyr_y = 0.0,
    gyr_z = 0.0,
    durum = 0,
) {
    // 78 bytes size byte array
    let my_bytes = new Uint8Array(78);
    my_bytes[0] = 0xff;
    my_bytes[1] = 0xff;
    my_bytes[2] = 0x54;
    my_bytes[3] = 0x52;
    // TAKIM ID SINI BURAYA YAZICAKSINN !!!!!!!
    my_bytes[4] = new Uint8Array([85])[0];
    my_bytes[5] = new Uint8Array([sayac])[0];

    irtifa = typeof irtifa === "number" ? irtifa : 0.0;
    let irtifa_bytes = new Float32Array([irtifa]);
    let irtifa_uint8 = new Uint8Array(irtifa_bytes.buffer);
    my_bytes.set(irtifa_uint8.slice(0, 4), 6);

    enlem = typeof enlem === "number" ? enlem : 0.0;
    boylam = typeof boylam === "number" ? boylam : 0.0;
    gps_irtifa = typeof gps_irtifa === "number" ? gps_irtifa : 0.0;
    let enlem_bytes = new Float32Array([enlem]);
    let enlem_uint8 = new Uint8Array(enlem_bytes.buffer);
    let boylam_bytes = new Float32Array([boylam]);
    let boylam_uint8 = new Uint8Array(boylam_bytes.buffer);
    let gps_irtifa_bytes = new Float32Array([gps_irtifa]);
    let gps_irtifa_uint8 = new Uint8Array(gps_irtifa_bytes.buffer);
    my_bytes.set(gps_irtifa_uint8.slice(0, 4), 10);
    my_bytes.set(enlem_uint8.slice(0, 4), 14);
    my_bytes.set(boylam_uint8.slice(0, 4), 18);
    let faydali_enlem_bytes = new Float32Array([faydali_enlem]);
    let faydali_enlem_uint8 = new Uint8Array(faydali_enlem_bytes.buffer);
    let faydali_boylam_bytes = new Float32Array([faydali_boylam]);
    let faydali_boylam_uint8 = new Uint8Array(faydali_boylam_bytes.buffer);
    let faydali_irtifa_bytes = new Float32Array([faydali_irtifa]);
    let faydali_irtifa_uint8 = new Uint8Array(faydali_irtifa_bytes.buffer);
    my_bytes.set(faydali_irtifa_uint8.slice(0, 4), 22);
    my_bytes.set(faydali_enlem_uint8.slice(0, 4), 26);
    my_bytes.set(faydali_boylam_uint8.slice(0, 4), 30);

    my_bytes[34] = 0xFF
    my_bytes[35] = 0xFF
    my_bytes[36] = 0xFF
    my_bytes[37] = 0xFF
    my_bytes[38] = 0xFF
    my_bytes[39] = 0xFF
    my_bytes[40] = 0xFF
    my_bytes[41] = 0xFF
    my_bytes[42] = 0xFF
    my_bytes[43] = 0xFF
    my_bytes[44] = 0xFF
    my_bytes[45] = 0xFF

    let gyr_x_bytes = new Float32Array([gyr_x]);
    let gyr_y_bytes = new Float32Array([gyr_y]);
    let gyr_z_bytes = new Float32Array([gyr_z]);
    let gyr_x_uint8 = new Uint8Array(gyr_x_bytes.buffer);
    let gyr_y_uint8 = new Uint8Array(gyr_y_bytes.buffer);
    let gyr_z_uint8 = new Uint8Array(gyr_z_bytes.buffer);
    my_bytes.set(gyr_x_uint8.slice(0, 4), 46);
    my_bytes.set(gyr_y_uint8.slice(0, 4), 50);
    my_bytes.set(gyr_z_uint8.slice(0, 4), 54);
    

    my_bytes[58] = 0xFF
    my_bytes[59] = 0xFF
    my_bytes[60] = 0xFF
    my_bytes[61] = 0xFF
    my_bytes[62] = 0xFF
    my_bytes[63] = 0xFF
    my_bytes[64] = 0xFF
    my_bytes[65] = 0xFF
    my_bytes[66] = 0xFF
    my_bytes[67] = 0xFF
    my_bytes[68] = 0xFF
    my_bytes[69] = 0xFF
    my_bytes[70] = 0xFF
    my_bytes[71] = 0xFF
    my_bytes[72] = 0xFF
    my_bytes[73] = 0xFF
    my_bytes[74] = 0xFF//durum

    my_bytes[75] = check_sum_hesapla(my_bytes);

    my_bytes[76] = 0x0D
    my_bytes[77] = 0x0A

    return my_bytes;
}

function check_sum_hesapla(my_bytes) {
    let check_sum = 0;
    for (let i = 4; i < 75; i++) {
        check_sum += my_bytes[i];
    }
    return check_sum % 256;
}

// let canvas = document.getElementById('canvas');

// // Sahne oluşturma
// const sahne = new THREE.Scene();
// sahne.background = new THREE.Color(0x202020);

// // Kamera oluşturma ve sahne görüntüsünü ayarlama
// const kamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// kamera.position.z = 5;

// // Renderer oluşturma ve görüntü ayarlarını ayarlama
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(canvas.clientWidth, canvas.clientHeight);
// canvas.appendChild(renderer.domElement);

// // Silindir oluşturma
// const yaricap = 0.8;
// const yukseklik = 3;
// const detay = 64;
// const silindir = new THREE.Mesh(new THREE.CylinderGeometry(yaricap, yaricap, yukseklik, detay), new THREE.MeshNormalMaterial());
// sahne.add(silindir);

// // Silindirin konumunu ayarlama
// silindir.position.set(0, 0, 0);

// // Animasyon döngüsü
// function animate() {
//     requestAnimationFrame(animate);
//     silindir.rotation.x = (gyro_y_datas[gyro_y_datas.length - 1] ) / 360 * 2 * Math.PI;
//     silindir.rotation.y = gyro_x_datas[gyro_x_datas.length - 1] / 360 * 2 * Math.PI;
//     renderer.render(sahne, kamera);
// }
// animate();