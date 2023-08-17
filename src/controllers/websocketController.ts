import { WebSocket } from "ws";
import { Session, Line } from "../models/Session";
import sessionController from "./sessionController";
import { WebSocketMessage } from "../models/dto/WebSocketMessage";

function handleWebSocketConnection(ws: WebSocket, sessionID: string) {
  if (!sessionController.isSessionExist(sessionID)) {
    sendErrorMessage(ws, "Session not found");
    ws.close();
    return;
  }

  const session = sessionController.getSession(sessionID);
  session?.addWebSocket(ws);
  sendGetMessage(ws, session);

  console.log(
    `Session Id: ${session?.id} Current Users ${session?.webSockets.size}`
  );

  ws.on("message", (message: string) => {
    try {
      // console.log(message);
      const parsedMessage: WebSocketMessage<any> = JSON.parse(message);
      const messageType = parsedMessage.type;
      const messageData = parsedMessage.data;

      const handler = messageHandlers[messageType];
      if (handler) {
        handler(ws, session, messageData);
      } else {
        console.warn("Unknown message type:", messageType);
      }
    } catch (error) {
      console.error("Error parsing message:", error, message);
    }
  });

  ws.on("close", () => {
    session?.removeWebSocket(ws);
    console.log(
      `Session Id: ${session?.id} Current Users ${session?.webSockets.size} `
    );

    // when no one is connected to the session, stop the session
    if (session?.webSockets.size == 0) {
      sessionController.stopSession(session);
    }
  });
}

const messageHandlers: Record<
  string,
  (ws: WebSocket, session: Session | undefined, data: any) => void
> = {
  get: handleGetMessage,
  draw: handleDrawMessage,
  clear: handleClearMessage,
};

function handleGetMessage(ws: WebSocket, session: Session | undefined) {
  sendGetMessage(ws, session);
}

function handleDrawMessage(
  ws: WebSocket,
  session: Session | undefined,
  data: Line
) {
  session?.addLine(data);
  session?.broadcastMessage({ type: "draw", data });
}

function handleClearMessage(
  ws: WebSocket,
  session: Session | undefined,
  data: any
) {
  const line = JSON.parse(data) as Line;
  session?.clearDraw();
  session?.broadcastMessage({ type: "clear", data: "" });
}

function sendErrorMessage(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({ type: "error", data: message }));
}

function sendGetMessage(ws: WebSocket, session: Session | undefined) {
  ws.send(JSON.stringify({ type: "get", data: session?.lines }));
}

export { handleWebSocketConnection };
