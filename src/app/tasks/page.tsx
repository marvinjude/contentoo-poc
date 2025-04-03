import { Metadata } from "next"
import { TaskList } from "./task-list"

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks and assignments",
}

export default function TasksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>
      <TaskList />
    </div>
  )
} 