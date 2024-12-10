import WebSocket from 'ws'
import ProtogenProcessor from './postProcessor/protogenProcessor.js'
import colours from './utils/colours.js'
import OsuProcessor from './postProcessor/osuProcessor.js'


const socket = new WebSocket('wss://jetstream2.us-west.bsky.network/subscribe?wantedCollections=app.bsky.feed.post');
const batchSize = 100;
let queue = [];
let isProcessing = false; // Flag to ensure we're not processing the queue multiple times simultaneously

// Function to process the queue in batches of 50

const log = (colour, name, text) => {
  const maxNameLength = 15; // Adjust this value based on your needs
  const padding = " ".repeat(maxNameLength - name.length);
  console.log(`${colours.Reset}${padding}${colour}[${name}]${colours.Reset} `, text);
};


const processQueue = async () => {
  if (isProcessing || queue.length < batchSize) return;

  isProcessing = true;
  const batch = queue.splice(0, batchSize); // Get the first 50 items
  log(colours.BgYellow, "info", `Processing batch of ${batch.length} items ` + (queue.length > 50 ? colours.BgRed : colours.BgGreen) + `with ` + queue.length + " sitting in queue" + colours.Reset);

  const data = batch.reduce((acc, item) => {
    if (item.kind === 'commit' && item.commit.collection === "app.bsky.feed.post") {
      var x = item.commit;
      x.author = item.did;
      x.uri = "at://" + item.did + "/app.bsky.feed.post/" + item.commit.rkey;



      if (item.commit.operation === "create") acc.creates.push(x);
      if (item.commit.operation === "delete") {
        //acc.deletes.push(x);
      }
    }
    return acc;
  }, { creates: [], deletes: [] });


  await ProtogenProcessor(data, (text) => {
    log(colours.BgBlue, "protogen", text);
  });
  await OsuProcessor(data, (text) => {
    log(colours.BgMagenta, "osu", text);
  });

  // After processing, reset the flag and continue processing after a short delay
  isProcessing = false;
};



socket.addEventListener('open', () => {
  console.log('WebSocket connection established.');
});

socket.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data);
    queue.push(data);
    processQueue();
  } catch (error) {
    console.warn('Could not parse message as JSON:', error);
  }
});

socket.addEventListener('close', (event) => {
  console.log('WebSocket connection closed:', event.code, event.reason);
});

socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
