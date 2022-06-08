import { appDiagramFactory } from './diagram/app-diagram-factory.js';
import { AppDiagramDurable } from './diagram/app-diagram-durable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

const svg = document.getElementById('diagram');

const diagram = new AppDiagramDurable(svg, appDiagramFactory(svg))
    .on('shapeAdd', function() {

        document.getElementById('tip')?.remove();
    });

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

/** @type {IMenuShape} */
(document.getElementById('menu-shape')).init(diagram);

let currentWebSocket = null;

let roomname = 'public';
let hostname = "durable-charts.denys-potapov.workers.dev";

function start() {
  document.location.hash = "#" + roomname;

  diagram.on('shapeAdd', event => {
    if (currentWebSocket) {
        currentWebSocket.send(JSON.stringify({added: "add"}));
    }
  });

  join();
}

function join() {
  let ws = new WebSocket("wss://" + hostname + "/api/chart/" + roomname + "/websocket");
  let rejoined = false;
  let startTime = Date.now();

  let rejoin = async () => {
    if (!rejoined) {
      rejoined = true;
      currentWebSocket = null;

      // Don't try to reconnect too rapidly.
      let timeSinceLastJoin = Date.now() - startTime;
      if (timeSinceLastJoin < 10000) {
        // Less than 10 seconds elapsed since last join. Pause a bit.
        await new Promise(resolve => setTimeout(resolve, 10000 - timeSinceLastJoin));
      }

      // OK, reconnect now!
      join();
    }
  }

  ws.addEventListener("open", event => {
    currentWebSocket = ws;
  });

  ws.addEventListener("message", event => {
    let data = JSON.parse(event.data);
    console.log('ws message', event.data);
  });  
  ws.addEventListener("close", event => {
    console.log("WebSocket closed, reconnecting:", event.code, event.reason);
    rejoin();
  });
  ws.addEventListener("error", event => {
    console.log("WebSocket error, reconnecting:", event);
    rejoin();
  });
}

start();