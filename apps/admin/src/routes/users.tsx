import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import UserList from "@/components/user-list";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/users")({
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: ({ context }) => {
    if (!context.session) {
      toast.warning("Please log in to access the user management.");
      throw redirect({
        to: "/login",
      });
    }
    if (context.session.user.role !== "admin") {
      toast.error("You do not have permission to access this page.");
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: UsersComponent,
});

function UsersComponent() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-bold text-3xl">User Management</h1>
      <UserList />
    </div>
  );
}
