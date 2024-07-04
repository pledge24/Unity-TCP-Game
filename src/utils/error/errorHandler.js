import { ErrorCodes } from './errorCodes.js';
import { createResponse } from '../response/createResponse.js';

// 에러 처리 함수. 
// 지정한 에러코드가 있다면 에러코드로, 없다면 일반에러로 에러문 출력
export const handlerError = (socket, error) => {
  let responseCode;
  let message;
  console.error(error);

  if (error.code) {
    responseCode = error.code;
    message = error.message;
    console.error(`에러코드: ${error.code}, 메세지: ${error.message}`);
  } else {
    responseCode = ErrorCodes.SOCKET_ERROR;
    message = error.message;
    console.error(`일반에러: ${error.message}`);
  }

  // 클라이언트에게도 에러 사실을 전송한다.
  const errorResponse = createResponse(-1, responseCode, { message }, null);
  socket.write(errorResponse);
};
