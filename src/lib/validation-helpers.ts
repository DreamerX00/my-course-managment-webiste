import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validates request body against a Zod schema
 * @param body - The request body to validate
 * @param schema - The Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  body: unknown,
  schema: T
): Promise<
  { success: true; data: z.infer<T> } | { success: false; error: NextResponse }
> {
  try {
    const parsed = schema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param searchParams - URL search params
 * @param schema - The Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse } {
  try {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    const parsed = schema.parse(params);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Invalid query parameters",
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      ),
    };
  }
}
