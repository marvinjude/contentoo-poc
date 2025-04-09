import { NextRequest, NextResponse } from "next/server";
import { Task } from "@/models/task";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { getIntegrationClient } from "@/lib/integration-app-client";

interface TaskUpdateParams extends RequestParams {
  params: {
    id: string;
  };
  body: {
    status: string;
  };
}

async function handler(
  request: NextRequest,
  auth: AuthCustomer,
  params: TaskUpdateParams
) {
  try {
    const taskId = params.params.id;
    const { status } = params.body;

    console.log({ status });

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    const task = await Task.findOne({ id: taskId, userId: auth.customerId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // find user connection for the task source (the integration)
    const integrationApp = await getIntegrationClient(auth);

    const connectionResponse = await integrationApp.connections.find({
      integrationKey: task?.source,
    });

    const connection = connectionResponse.items[0];

    const result = await integrationApp
      .connection(connection.id)
      .action("update-tasks")
      .run({
        id: task.id,
        status: status,
      });

    console.log({ result });

    task.status = status;
    await task.save();

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export const PATCH = APIHandler<TaskUpdateParams>(handler);
