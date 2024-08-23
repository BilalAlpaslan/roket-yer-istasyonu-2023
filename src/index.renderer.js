const { ipcRenderer } = require("electron");

let datas = [];

ipcRenderer.on("data-rec", (event, data) => {
  datas.push(data);
  console.log(data);
  Plotly.newPlot("myDiv", [
    {
      y: datas,
      mode: "lines",
      line: { color: "#80CAF6" },
    },
  ]);

  var cnt = 0;

  var interval = setInterval(function () {
    Plotly.extendTraces(
      "myDiv",
      {
        y: datas,
      },
      [0]
    );

    if (++cnt === 1000) clearInterval(interval);
  }, 300);
});

// Adding CSS directly in the HTML
const style = document.createElement("style");
style.innerHTML = `
  .serial-button {
    padding: 10px 20px;
    margin: 5px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .serial-button:hover {
    background-color: #0056b3;
  }
`;
document.head.appendChild(style);

// Function to send data via IPC
function sendSerialData(number) {
  ipcRenderer.send("serial-send", number);
}

// Creating buttons with CSS class
for (let i = 1; i <= 5; i++) {
  let button = document.createElement("button");
  button.innerText = `Send ${i}`;
  button.className = "serial-button";
  button.addEventListener("click", () => sendSerialData(i));
  document.body.appendChild(button);
}
