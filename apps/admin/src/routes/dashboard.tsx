import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: ({ context }) => {
    if (!context.session) {
      toast.warning("Please log in to access the admin dashboard.");
      throw redirect({
        to: "/login",
      });
    }
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-bold text-3xl">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
          <a className="block h-full" href="/users">
            <h3 className="mb-2 font-semibold text-lg">Users</h3>
            <p className="text-muted-foreground text-sm">
              Manage user accounts and permissions
            </p>
          </a>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-semibold text-lg">Content</h3>
          <p className="text-muted-foreground text-sm">
            Manage posts and content moderation
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-semibold text-lg">Analytics</h3>
          <p className="text-muted-foreground text-sm">
            View platform statistics and insights
          </p>
        </div>
      </div>
    </div>
  );
}
