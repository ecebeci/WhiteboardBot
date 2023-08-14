import { WebSocket } from "ws";
import { WebSocketMessage } from "./dto/WebSocketMessage";
import { createCanvas, Canvas } from "canvas";
import { Message } from "discord.js";
//import discordController from "../controllers/discordController";
type CanvasUpdateCallback = (message: Message, canvas: Canvas) => void;

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default class Session {
  id: string;
  webSockets: Set<WebSocket>;
  lines: Line[] = [];
  canvas: Canvas;
  message: Message;
  updateInterval: NodeJS.Timeout | undefined;
  private canvasUpdateCallback: CanvasUpdateCallback | null = null;

  constructor(id: string) {
    this.id = id;
    this.webSockets = new Set();
    this.message = {} as Message;
    this.canvas = createCanvas(1920, 1080);
    this.startPeriodicUpdate();
  }

  addLine(line: Line) {
    this.lines.push(line);
  }

  clearDraw() {
    this.lines = [];
  }

  addWebSocket(ws: WebSocket) {
    this.webSockets.add(ws);
  }

  removeWebSocket(ws: WebSocket) {
    this.webSockets.delete(ws);
  }

  stopAllWebSocket() {
    this.webSockets.forEach((ws) => {
      ws.close();
    });
  }

  broadcastMessage(message: WebSocketMessage<any>) {
    this.webSockets.forEach((ws) => {
      ws.send(JSON.stringify(message));
    });
  }

  startPeriodicUpdate() {
    this.updateInterval = setInterval(() => {
      this.renderCanvas();
    }, 5000);
  }

  stopPeriodicUpdate() {
    clearInterval(this.updateInterval);
  }

  setCanvasUpdateCallback(callback: CanvasUpdateCallback) {
    this.canvasUpdateCallback = callback;
  }

  renderCanvas() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    this.lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    if (this.canvasUpdateCallback) {
      this.canvasUpdateCallback(this.message, this.canvas);
    }
  }

  setMessage(message: Message) {
    this.message = message;
  }
}

export { Session, Line };
