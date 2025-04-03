import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";

// Define the specific parameters for this endpoint
interface UsersParams extends RequestParams {
  query: {
    limit?: string;
    search?: string;
  };
}

async function handler(
  request: NextRequest,
  auth: AuthCustomer,
  params: UsersParams
) {
  const { limit = "10", search } = params.query;

  const query: any = { customerId: auth.customerId };

  if (search) {
    query.userName = { $regex: search, $options: "i" };
  }

  const users = await User.find(query)
    .select("userId userName createdAt updatedAt")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10));

  return NextResponse.json({ users }, { status: 200 });
}

export const GET = APIHandler<UsersParams>(handler);
