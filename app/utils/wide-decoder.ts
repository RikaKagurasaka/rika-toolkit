/**
 * Decodes input string from various encoding formats
 * Supported formats:
 * - \xHH or \XHH hex escape sequences
 * - %HH URL encoding
 * - \uHHHH or \UHHHH Unicode escape sequences
 * - Base64 encoded strings
 * - Common escape sequences (\n, \r, \t, etc.)
 * - Comma or space-separated decimal or hex values
 *
 * @param input The encoded string to decode
 * @returns The decoded string
 */
export function wideDecode(input: string): string {
  // Return empty string for empty input
  if (!input || input.trim() === "") {
    return "";
  }

  // Check if it looks like a comma or space-separated list of hex/decimal numbers
  if (
    /^([\s\[\(]*([0-9a-fA-F]{1,3})[,\s]+)*([0-9a-fA-F]{1,3})[\s\)\]]*$/.test(
      input
    )
  ) {
    const result = decodeNumberList(input);
    if (result) return result;
  }

  // Check if input might be base64
  if (/^[A-Za-z0-9+/=]+$/.test(input) && input.length % 4 === 0) {
    try {
      const buffer = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
      // Try to decode as UTF-8 first
      try {
        const decoder = new TextDecoder("utf-8", { fatal: true });
        const result = decoder.decode(buffer);
        return result;
      } catch (e) {
        // Not valid UTF-8, fallback to normal toString
        const result = buffer.toString();
        return result;
      }
    } catch (e) {
      // Not valid base64, continue with other formats
    }
  }

  // Handle escape sequences
  return decodeEscapeSequences(input);
}

/**
 * Decodes a comma or space-separated list of numbers (decimal or hex)
 */
function decodeNumberList(input: string): string | null {
  const parts = input.split(/[\s,\[\]\(\)]+/).filter(Boolean);

  // Check if all parts are valid numbers
  if (!parts.every((part) => /^([0-9]{1,3}|[0-9a-fA-F]{2})$/.test(part))) {
    return null;
  }

  const isDecimal = parts.every((part) => /^[0-9]{1,3}$/.test(part));

  const bytes = parts.map((part) => {
    if (isDecimal) {
      return parseInt(part, 10);
    } else {
      return parseInt(part, 16);
    }
  });

  // Use TextDecoder for UTF-8 decoding
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(new Uint8Array(bytes));
  } catch (e) {
    // Fallback to Buffer if TextDecoder fails
    return Buffer.from(bytes).toString();
  }
}

/**
 * Decodes escape sequences in a string
 */
function decodeEscapeSequences(input: string): string {
  // Process the input in two steps to handle nested escapes
  let result = input
    // Handle \xHH hex escapes
    .replace(/\\[xX]([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    // Handle URL encoding %HH
    .replace(/%([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

  // Create a Uint8Array from the result string
  const bytes = new Uint8Array(result.length);
  for (let i = 0; i < result.length; i++) {
    bytes[i] = result.charCodeAt(i);
  }

  // Try to decode as UTF-8
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const decoded = decoder.decode(bytes);
    if (decoded !== result) {
      return decoded;
    }
  } catch (e) {
    // Continue with original result if TextDecoder fails
  }
  result = result // Handle \uHHHH unicode escapes
    .replace(/\\[uU]([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    // Handle common escapes
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\\/g, "\\")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  return result;
}
