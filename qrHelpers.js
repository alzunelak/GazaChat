export function encodeData(data) {
  return JSON.stringify(data);
}

export function decodeData(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
