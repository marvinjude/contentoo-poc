import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { ITask } from "@/models/task";

interface TasksResponse {
  tasks: ITask[];
}

interface UseTasksOptions {
  search?: string;
  freelancerId?: string;
  onSuccess?: (data: TasksResponse) => void;
  onError?: (error: Error) => void;
}

export function useTasks({
  search,
  freelancerId,
  onSuccess,
  onError,
}: UseTasksOptions = {}) {
  const queryParams = new URLSearchParams({
    ...(search && { search }),
    ...(freelancerId && { freelancerId }),
  });

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<TasksResponse>(
    `/api/tasks?${queryParams.toString()}`,
    authenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => onSuccess?.(data),
      onError: (error) => onError?.(error),
    }
  );

  const mutate = async () => {
    return swrMutate();
  };

  return {
    tasks: data?.tasks ?? [],
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error : null,
    mutate,
  };
}
