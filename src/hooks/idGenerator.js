// idGenerator.js
import { v4 as uuidv4 } from "uuid";
import base64url from "base64url";

/**
 * Tạo một ID duy nhất sử dụng UUID v4 và mã hóa Base64.
 * @returns {string} ID dạng Base64
 */
const createId = () => {
  const uuid = uuidv4(); // Tạo UUID
  const base64Id = base64url(uuid); // Chuyển UUID trực tiếp thành Base64
  return base64Id;
};

export default createId;
