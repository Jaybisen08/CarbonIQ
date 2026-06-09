/**
 * Safely parses any fetch Response as JSON after validating the HTTP response status
 * and content-type.
 */
export async function safeFetchJson<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but received:", text);
    throw new Error(`Expected JSON but received:\n${text}`);
  }

  try {
    return await response.json() as T;
  } catch (err: any) {
    console.error("Failed to parse JSON response:", err);
    throw new Error("Invalid JSON received from the server.");
  }
}
