import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user";
import { APIHandler } from "@/lib/api-middleware";
import { getIntegrationClient } from "@/lib/integration-app-client";
import type { AuthCustomer } from "@/lib/auth";

interface ExternalUser {
  id: string;
  name: string;
}

async function handler(request: NextRequest, auth: AuthCustomer) {
  const client = await getIntegrationClient(auth);

  const connectionsResponse = await client.connections.find();
  const firstConnection = connectionsResponse.items?.[0];

  if (!firstConnection) {
    return NextResponse.json(
      { error: "No apps connected to import users from" },
      { status: 400 }
    );
  }

  const result = await client
    .connection(firstConnection.id)
    .action("list-users")
    .run();

  const externalUsers = result.output.records as unknown as ExternalUser[];

  await User.deleteMany({ customerId: auth.customerId });

  const users = await User.create(
    externalUsers.map((extUser) => ({
      userId: extUser.id,
      userName: extUser.name,
      customerId: auth.customerId,
    }))
  );

  return NextResponse.json({ users }, { status: 200 });
}

export const POST = APIHandler(handler);
