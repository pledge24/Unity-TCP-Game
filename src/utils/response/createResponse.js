import { getProtoMessages } from '../../init/loadProtos.js';
import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';

export const createResponse = (handlerId, responseCode, data = null) => {
  const protoMessages = getProtoMessages();
  const Response = protoMessages.response.Response;

  // 응답 페이로드 생성
  // 응답 페이로드: { handlerId, responseCode, timestamp, data }
  const responsePayload = {
    handlerId,
    responseCode,
    timestamp: Date.now(),
    data: data ? Buffer.from(JSON.stringify(data)) : null,
  };

  // protoBuf를 이용해 바이트배열 타입 데이터 생성
  const buffer = Response.encode(responsePayload).finish();

  // TOTAL_LENGTH 헤더 생성.
  const packetLength = Buffer.alloc(config.packet.totalLength);
  packetLength.writeUInt32BE(
    buffer.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  // PACKET_TYPE 헤더 생성.
  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUInt8(PACKET_TYPE.NORMAL, 0);

  // 완성된 응답 패킷 반환.
  return Buffer.concat([packetLength, packetType, buffer]);
};
