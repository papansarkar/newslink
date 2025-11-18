import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/todos")({
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: ({ context }) => {
    if (!context.session) {
      toast.warning("Please log in to access your dashboard.");
      throw redirect({
        to: "/login",
      });
    }
  },
  component: TodosRoute,
});

function TodosRoute() {
  const [newTodoText, setNewTodoText] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const todos = useQuery(orpc.todo.getAll.queryOptions());
  const createMutation = useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        todos.refetch();
        setNewTodoText("");
      },
      onError: (err) => {
        setDeletingId(null);
        console.error("Failed to add todo:", err);
        toast.error(`${err.message}: could not add todo`);
      },
    })
  );
  const toggleMutation = useMutation(
    orpc.todo.toggle.mutationOptions({
      onSuccess: () => {
        setTimeout(() => {
          todos.refetch();
          setTogglingId(null);
        }, 500);
      },
      onError: (err) => {
        setDeletingId(null);
        setTogglingId(null);
        console.error("Failed to add todo:", err);
        toast.error(`${err.message}: could not toggle todo`);
      },
    })
  );
  const deleteMutation = useMutation(
    orpc.todo.delete.mutationOptions({
      onSuccess: () => {
        setTimeout(() => {
          todos.refetch();
          setDeletingId(null);
        }, 500);
      },
      onError: (err) => {
        setDeletingId(null);
        console.error("Failed to delete todo:", err);
        toast.error(`${err.message}: could not delete todo`);
      },
    })
  );

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createMutation.mutate({ text: newTodoText });
    }
  };

  const handleToggleTodo = (id: number, completed: boolean) => {
    setTogglingId(id);
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate({ id });
  };

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="mb-6 flex items-center space-x-2"
            onSubmit={handleAddTodo}
          >
            <Input
              disabled={createMutation.isPending}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
              value={newTodoText}
            />
            <Button
              disabled={createMutation.isPending || !newTodoText.trim()}
              type="submit"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>

          {todos.isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {!todos.isLoading && (!todos.data || todos.data.length === 0) && (
            <p className="py-4 text-center">No todos yet. Add one above!</p>
          )}
          {!todos.isLoading && todos.data && todos.data.length > 0 && (
            <ul className="space-y-3">
              {todos.data.map((todo) => (
                <TodoItem
                  completed={todo.completed}
                  createdAt={todo.createdAt}
                  deletingId={deletingId}
                  id={todo.id}
                  isDeleting={deleteMutation.isPending}
                  isToggling={toggleMutation.isPending}
                  key={todo.id}
                  onDelete={handleDeleteTodo}
                  onToggle={handleToggleTodo}
                  text={todo.text}
                  togglingId={togglingId}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type TodoItemProps = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  deletingId: number | null;
  togglingId: number | null;
  isDeleting: boolean;
  isToggling: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
};

function TodoItem({
  id,
  text,
  completed,
  createdAt,
  deletingId,
  isDeleting,
  togglingId,
  isToggling,
  onToggle,
  onDelete,
}: TodoItemProps) {
  const isCurrentlyDeleting = deletingId === id;
  const isCurrentlyToggling = togglingId === id;

  const isCompleting = isCurrentlyToggling && !completed;
  const isUncompleting = isCurrentlyToggling && completed;
  const isCompleted = completed && !isUncompleting;

  const completedClasses = completed
    ? "line-through text-muted-foreground"
    : "";
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li
      className={clsx(
        "relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        isCurrentlyDeleting && "slide-red-fill",
        isCompleting && "todo-item-completing",
        isUncompleting && "todo-item-uncompleting",
        isCompleted && "todo-item-completed"
      )}
    >
      <div className={clsx("relative z-[1] flex w-full flex-col gap-0")}>
        {/* Top Row */}
        <div
          className={clsx("grid grid-cols-[auto_1fr_auto] items-center gap-3")}
        >
          <Checkbox
            checked={completed}
            className="rounded-full"
            disabled={isDeleting || isToggling}
            id={`todo-${id}`}
            onCheckedChange={() => onToggle(id, completed)}
          />

          <label
            className={clsx(
              "wrap-break-word cursor-pointer font-medium text-sm leading-relaxed",
              completedClasses
            )}
            htmlFor={`todo-${id}`}
          >
            {text}
          </label>

          <Button
            aria-label={`Delete todo: ${text}`}
            disabled={isDeleting || isToggling}
            onClick={() => onDelete(id)}
            size="icon"
            variant="ghost"
          >
            {isDeleting && isCurrentlyDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Date */}
        <p className="text-muted-foreground text-xs">{formattedDate}</p>
      </div>
    </li>
  );
}
