import { getUserBySocket, removeUser } from '../session/user.session.js';
import { getGameSession } from '../session/game.session.js';
import { findUserByDeviceID, updateUserLastposition } from '../db/user/user.db.js';

export const onEnd = (socket) => async () => {
  console.log('클라이언트 연결이 종료되었습니다.');
  
  const user = getUserBySocket(socket);
  const userUuid = (await findUserByDeviceID(user.id)).id
  console.log("onEnd: findUserByDeviceID Executed! userUuid: ", userUuid);
  const test = await updateUserLastposition(userUuid, user.x, user.y);
  console.log("updateUserLastposition(userUuid, user.x, user.y): ", test);

  // 세션에서 유저 삭제
  removeUser(socket);

  const gameSession = getGameSession();
  gameSession.removeUser(socket);
};
