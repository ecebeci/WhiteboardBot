import { Message } from "discord.js";
import Session from "../models/Session";
const sessions = new Map<string, Session>();

function createSession(): Session {
  const sessionID = Math.random().toString(36).substring(7);
  if (!sessions.has(sessionID)) {
    const session = new Session(sessionID);
    sessions.set(sessionID, session);
    return session;
  }

  return sessions.get(sessionID) as Session;
}

function isSessionExist(sessionID: string): boolean {
  return sessions.has(sessionID);
}

// function getSession(sessionID: string): Session | undefined {
//   return sessions.get(sessionID);
// }

export { sessions, createSession, isSessionExist };
