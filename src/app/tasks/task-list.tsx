"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useTasks } from "@/hooks/use-tasks"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { authenticatedFetcher } from "@/lib/fetch-utils"

export function TaskList() {
  const { tasks, isLoading, isError, error, mutate } = useTasks()
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'default_task':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {

    try {
      setUpdatingTaskId(taskId)

      // Call the API endpoint to update the task status using authenticatedFetcher
      await authenticatedFetcher(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Refresh the tasks list
      await mutate()

      toast.success("Task status updated successfully")
    } catch (error) {
      console.error("Failed to update task status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update task status")
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (isError) {
    return (
      <div className="p-6 border rounded-md">
        <p className="text-red-500">Failed to load tasks: {error?.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title || 'Untitled'}</TableCell>
                <TableCell>{task.description || 'No description'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status ? task.status.replace(/_/g, ' ') : 'N/A'}
                    </span>
                    <Select
                      defaultValue={task.status}
                      onValueChange={(value: string) => handleStatusChange(task.id, value)}
                      disabled={updatingTaskId === task.id}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(task.createdAt), "PPP")}</TableCell>
                <TableCell>{task.source || "N/A"}</TableCell>
                <TableCell>
                  {task.freelancerEmail ? (
                    <span className="text-sm">{task.freelancerEmail}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 