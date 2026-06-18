import LoginHistory from "../models/loginHistory.model.js";

const queue = [];
let isProcessing = false;

export function enqueueLoginLog(data) {
  queue.push(data);
  if (!isProcessing) processQueue();
} 

async function processQueue() {
  isProcessing = true;
  while (queue.length > 0) {
    const entry = queue.shift();
    try {
      await LoginHistory.create(entry);
    } catch (err) {
      console.error("Login history queue error:", err.message);
    }
  }
  isProcessing = false;
}