import { addUser } from '../../session/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { handlerError } from '../../utils/error/errorHandler.js';
import { getGameSession } from '../../session/game.session.js';
import { createUser, findUserByDeviceID, findUserLastpositionByID, updateUserLogin } from '../../db/user/user.db.js';

// 초기화 핸들러. 클라이언트에게 접속 요청을 받을 때 사용한다.
// InitialPayload: {deviceId, playerId, latency}
const initialHandler = async ({ socket, userId, payload }) => {
  try {
    const { deviceId, playerId, latency } = payload;

    console.log("deviceId, playerId, latency", deviceId, playerId, latency);

    let userData = await findUserByDeviceID(deviceId);
    if (!userData) {
      userData = await createUser(deviceId);
    } else {
      await updateUserLogin(userData.id);
    }

    console.log("userData", userData)
    // 해당 유저의 마지막 위치를 가져온다.
    const lastpositon = await findUserLastpositionByID(userData.id);

    console.log("lastpositon", lastpositon);

    // 유저 세션에 해당 유저 추가, 해당 유저 게임 세션에 추가.
    const user = addUser(socket, deviceId, playerId, latency);
  
    // 해당 유저 스폰 위치를 최근 위치로 설정.
    user.x = lastpositon.x;
    user.y = lastpositon.y;
    // const packet = createLocationPacket([user]);
    // socket.write(packet);

    // 게임 세션이 1개이기 때문에 방이라는 개념이 없어
    // createGame, joinGame 핸들러 대신 여기서 게임 세션을 추가한다.
    const gameSession = getGameSession();
    gameSession.addUser(user);

    user.updatePosition
    // 초기화 핸들러를 성공적으로 처리했을경우, 응답 패킷 만들어 클라이언트에게 전송한다.
    const initialResponse = createResponse(HANDLER_IDS.INITIAL, RESPONSE_SUCCESS_CODE, {
      // userId: deviceId,
      x: user.x,
      y: user.y
    });
    socket.write(initialResponse);

    

  } catch (e) {
    handlerError(socket, e);
  }
};

export default initialHandler;
