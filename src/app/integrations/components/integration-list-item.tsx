"use client";

import { useIntegrationApp } from "@integration-app/react";
import type { Integration as IntegrationAppIntegration } from "@integration-app/sdk";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { toast } from "sonner";
import { SyncStatusType } from "@/models/sync-status";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { useState } from "react";

interface IntegrationListItemProps {
  integration: IntegrationAppIntegration;
  onRefresh: () => void;
}

export function IntegrationListItem({
  integration,
  onRefresh,
}: IntegrationListItemProps) {
  const integrationApp = useIntegrationApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const { status: syncStatus, isLoading: isSyncLoading } = useSyncStatus({
    connectionId: integration.connection?.id,
    shouldRefresh: isSyncing,
    onSuccess: () => {
      toast.success("Sync completed successfully");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error || "Sync failed");
    },
  });

  console.log(syncStatus);

  const startSync = async (connectionId: string, integrationId: string) => {
    try {
      await authenticatedFetcher(
        `/api/integration/${connectionId}/sync-tasks`,
        {
          method: "POST",
          body: JSON.stringify({ integrationId }),
        }
      );

      setIsSyncing(true);
    } catch (error) {
      console.error("Failed to start sync:", error);
    }
  };

  const handleConnect = async () => {
    try {
      const connection = await integrationApp
        .integration(integration.key)
        .openNewConnection();

      if (!connection.id) {
        toast.error("Please select a connection first");
        return;
      }

      const integrationId = connection.integrationId;
      const IntNeedsDataSourceAndFieldMapping = ["asana", "monday", "notion"];

      if (
        IntNeedsDataSourceAndFieldMapping.includes(
          connection.name.toLowerCase()
        )
      ) {
        await integrationApp
          .connection(connection.id)
          .dataSource("tasks")
          .openConfiguration();

        await integrationApp
          .connection(connection.id)
          .fieldMapping("task")
          .openConfiguration();
      }

      startSync(connection.id, integrationId);

      onRefresh();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async () => {
    if (!integration.connection?.id) return;
    try {
      await integrationApp.connection(integration.connection.id).archive();
      onRefresh();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const getSyncStatusText = () => {
    if (!syncStatus) return null;

    switch (syncStatus.status) {
      case SyncStatusType.INPROGRESS:
        return "Syncing...";
      case SyncStatusType.COMPLETED:
        return "Sync completed";
      case SyncStatusType.FAILED:
        return "Sync failed";
      default:
        return null;
    }
  };

  return (
    <li className="group flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex-shrink-0">
        {integration.logoUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={integration.logoUri}
            alt={`${integration.name} logo`}
            className="w-10 h-10 rounded-lg"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300">
            {integration.name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
          {integration.name}
        </h3>
        {isSyncLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading sync status...
          </p>
        )}
        {syncStatus && (
          <p
            className={`text-sm ${syncStatus.status === SyncStatusType.FAILED
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {getSyncStatusText()}
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() =>
            integration.connection ? handleDisconnect() : handleConnect()
          }
          className={`px-4 py-2 rounded-md font-medium transition-colors ${integration.connection
            ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100 hover:bg-red-200 hover:text-red-800 dark:hover:bg-red-800 dark:hover:text-red-100"
            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-700 dark:hover:text-blue-100"
            }`}
          disabled={isSyncLoading}
        >
          {integration.connection ? "Disconnect" : "Connect"}
        </button>
      </div>
    </li>
  );
}
