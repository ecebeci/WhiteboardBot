import { Message } from "discord.js";
import Session from "../models/Session";
import discordController from "./discordController";
const sessions = new Map<string, Session>();

function createSession(): Session {
  const sessionID = Math.random().toString(36).substring(7);
  if (!sessions.has(sessionID)) {
    const session = new Session(sessionID);
    session.setCanvasUpdateCallback(discordController.updateMessageCanvas);
    sessions.set(sessionID, session);
    return session;
  }

  return sessions.get(sessionID) as Session;
}

function stopSession(session: Session) {
  discordController.stopMessage(session.message);
  session.stopPeriodicUpdate();
  deleteSession(session.id);
}

function isSessionExist(sessionID: string): boolean {
  return sessions.has(sessionID);
}

function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}

function getSession(sessionID: string): Session | undefined {
  return sessions.get(sessionID);
}
export default {
  createSession,
  stopSession,
  isSessionExist,
  getSession,
  deleteSession,
};
