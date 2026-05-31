import { supabase } from "@/integrations/supabase/client";

export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

interface InvokeOptions {
  functionName: string;
  body: Record<string, any>;
  maxRetries?: number;
  timeoutMs?: number;
  retryableStatuses?: number[];
}

/**
 * Resilient edge function invocation with retry, timeout, and structured error handling.
 * Returns parsed data or throws with a meaningful error message.
 */
export async function invokeEdgeFunction<T = any>({
  functionName,
  body,
  maxRetries = 2,
  timeoutMs = 12000,
  retryableStatuses = [429, 500, 502, 503, 504, 522, 544],
}: InvokeOptions): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[EdgeFn] ${functionName} attempt ${attempt + 1}/${maxRetries + 1}`);

      // Use fetch directly for better control over timeout and response handling
      const session = await supabase.auth.getSession();
      const accessToken = session.data?.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const url = `${supabaseUrl}/functions/v1/${functionName}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: anonKey,
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      } else {
        headers["Authorization"] = `Bearer ${anonKey}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Parse response body safely
      let responseData: any;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("text/event-stream")) {
        // Streaming response - return the raw response
        return response as unknown as T;
      }

      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.error(`[EdgeFn] ${functionName}: non-JSON response (status ${response.status}):`, responseText.substring(0, 200));
        throw new Error(`Invalid response from ${functionName}`);
      }

      // Handle non-2xx status codes
      if (!response.ok) {
        const errorMsg = responseData?.error || `${functionName} returned status ${response.status}`;
        console.warn(`[EdgeFn] ${functionName}: status ${response.status}:`, errorMsg);

        // Don't retry non-retryable errors (400 bad request, 401 auth, 402 credits)
        if (!retryableStatuses.includes(response.status)) {
          throw new Error(errorMsg);
        }

        // Retryable error
        throw new Error(errorMsg);
      }

      // Success - check for nested error field
      if (responseData?.error && !responseData?.success) {
        throw new Error(responseData.error);
      }

      // Return data - handle both { success, data } and direct response patterns
      if (responseData?.success !== undefined) {
        return responseData.data as T;
      }
      return responseData as T;

    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry aborted requests (timeout) or non-retryable errors
      const isTimeout = err?.name === "AbortError";
      const isNonRetryable = lastError.message.includes("credits") ||
        lastError.message.includes("not configured") ||
        lastError.message.includes("bad request") ||
        lastError.message.includes("is required");

      if (isTimeout) {
        lastError = new Error(`${functionName} timed out after ${timeoutMs / 1000}s`);
      }

      if (isNonRetryable && !isTimeout) {
        throw lastError;
      }

      console.warn(`[EdgeFn] ${functionName} attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
        console.log(`[EdgeFn] Retrying ${functionName} in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error(`${functionName} failed after ${maxRetries + 1} attempts`);
}

/**
 * Safely parse JSON that might contain control characters from AI responses
 */
export function safeParseJSON(raw: string): any {
  // Strip markdown fences
  let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  // Remove non-printable control characters except newlines/tabs
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return JSON.parse(cleaned);
}
