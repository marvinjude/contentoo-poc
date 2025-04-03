import { NextResponse } from "next/server";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import { SyncStatus } from "@/models/sync-status";

interface SyncStatusParams extends RequestParams {
  params: {
    connectionId: string;
  };
}

export const GET = APIHandler<SyncStatusParams>(
  async (request, auth, params) => {
    try {
      const { connectionId } = params.params;

      const syncStatus = await SyncStatus.findOne({ connectionId })
        .sort({ createdAt: -1 })
        .lean();

      if (!syncStatus) {
        return NextResponse.json(
          { error: "No sync status found" },
          { status: 404 }
        );
      }

      return NextResponse.json(syncStatus);
    } catch (error) {
      console.error("Error getting sync status:", error);
      return NextResponse.json(
        { error: "Failed to get sync status" },
        { status: 500 }
      );
    }
  }
);
