"use client"

import { useIntegrations } from "@integration-app/react"
import { IntegrationListItem } from "./integration-list-item"

export function IntegrationList() {
  const { integrations, refresh } = useIntegrations()

  return (
    <div className="space-y-4">
      <ul className="space-y-4 mt-8">
        {integrations.map((integration) => (
          <IntegrationListItem
            key={integration.key}
            integration={integration}
            onRefresh={refresh}
          />
        ))}
      </ul>
    </div>
  )
}
