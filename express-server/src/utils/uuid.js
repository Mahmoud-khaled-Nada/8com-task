import { v1 as uuidv1 } from 'uuid';

export function generateUUID() {
  return uuidv1({
  node: Uint8Array.of(0x01, 0x23, 0x45, 0x67, 0x89, 0xab),
  clockseq: 0x1234,
  msecs: new Date('2011-11-01').getTime(),
  nsecs: 5678,
});
}