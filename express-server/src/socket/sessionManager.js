
const sessions = new Map();

export const getUserSocket = (userId) => sessions.get(userId);
export const setUserSocket = (userId, socket) => sessions.set(userId, socket);
export const removeUserSocket = (userId) => sessions.delete(userId);
export const getAllSockets = () => sessions;

export const getConnectedUserIds = () => Array.from(sessions.keys());

export const getConnectedUsers = () => {
  return Array.from(sessions.values()).map((socket) => socket.user);
};

export const sendToUser = (userId, event, data) => {
  const socket = getUserSocket(userId);
  if (socket) {
    socket.emit(event, data);
    return true;
  }
  return false;
};

export const broadcastToAll = (event, data) => {
  sessions.forEach((socket) => {
    socket.emit(event, data);
  });
};

export const broadcastToUsers = (userIds, event, data) => {
  userIds.forEach((userId) => {
    const socket = getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
    }
  });
};