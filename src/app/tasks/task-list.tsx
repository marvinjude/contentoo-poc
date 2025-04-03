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

// Define a type for the freelancer object that might be returned from the API
interface FreelancerData {
  id: string;
  email: string;
}

export function TaskList() {
  const { tasks, isLoading, isError, error } = useTasks()

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
              <TableHead>Created</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{format(new Date(task.createdAt), "PPP")}</TableCell>
                <TableCell>{task.source || "N/A"}</TableCell>
                <TableCell>
                  {task.freelancerId ? (
                    <span className="text-sm">
                      {typeof task.freelancerId === 'object'
                        ? (task.freelancerId as FreelancerData).email || 'Unknown'
                        : task.freelancerId}
                    </span>
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