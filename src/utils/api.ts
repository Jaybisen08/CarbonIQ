/**
 * Safely parses any fetch Response as JSON after validating the HTTP response status
 * and content-type.
 */
export async function safeFetchJson<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    let errMessage = `HTTP Error: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errJson = await response.json();
        if (errJson && errJson.error) {
          errMessage = errJson.error;
        }
      } else {
        const text = await response.text();
        if (text && text.trim().length > 0 && text.length < 200) {
          errMessage = text.trim();
        }
      }
    } catch (e) {
      // ignore parsing errors on error response
    }
    throw new Error(errMessage);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but received non-JSON payload:", text);
    throw new Error(
      `Expected JSON response but received: ${
        text && text.trim().length > 0 
          ? (text.length > 120 ? text.substring(0, 120) + '...' : text) 
          : 'empty body'
      }`
    );
  }

  try {
    return await response.json() as T;
  } catch (err: any) {
    console.error("Failed to parse JSON response:", err);
    throw new Error("Invalid JSON received from the server.");
  }
}
