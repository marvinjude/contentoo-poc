type FormData = {
  title?: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  assigneeId?: string;
  tags: string[];
};

<div className="space-y-2">
  <Label htmlFor="title">Title</Label>
  <Input
    id="title"
    placeholder="Enter task title"
    {...register('title')}
  />
</div> 