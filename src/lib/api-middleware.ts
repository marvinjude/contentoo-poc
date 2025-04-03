import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "./server-auth";
import type { AuthCustomer } from "./auth";
import connectDB from "./mongodb";

// Generic types for request parameters
export interface RequestParams {
  query?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

// Generic type for the handler function
export type ApiHandler<T extends RequestParams = RequestParams> = (
  request: NextRequest,
  auth: AuthCustomer,
  params: T
) => Promise<NextResponse>;

async function getRequestBody(request: NextRequest): Promise<unknown> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  try {
    return await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return undefined;
  }
}

export function APIHandler<T extends RequestParams = RequestParams>(
  handler: ApiHandler<T>
) {
  return async (
    request: NextRequest,
    { params: routeParams }: { params: Promise<T["params"]> }
  ) => {
    try {
      const auth = getAuthFromRequest(request);

      if (!auth.customerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();

      const searchParams = request.nextUrl.searchParams;
      const query = searchParams.get("query");

      const requestParams: T = {
        query,
        params: await routeParams,
        body: await getRequestBody(request),
      } as unknown as T;

      return handler(request, auth, requestParams);
    } catch (error) {
      console.error("API Error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
