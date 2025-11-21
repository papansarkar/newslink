import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserList() {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });
      if (res.error) {
        throw res.error;
      }
      return res.data;
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      const res = await authClient.admin.setRole({
        userId,
        role,
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await authClient.admin.banUser({
        userId,
        banReason: "Banned by admin",
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User banned");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to ban user");
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await authClient.admin.unbanUser({
        userId,
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unbanned");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to unban user");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading users: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage users, roles, and access.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="h-12 px-4 align-middle font-medium">Name</th>
                <th className="h-12 px-4 align-middle font-medium">Email</th>
                <th className="h-12 px-4 align-middle font-medium">Role</th>
                <th className="h-12 px-4 align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.users.map((user) => (
                <tr
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  key={user.id}
                >
                  <td className="p-4 align-middle font-medium">{user.name}</td>
                  <td className="p-4 align-middle">{user.email}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{user.role || "user"}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {user.banned ? (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 font-semibold text-red-700 text-xs dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 font-semibold text-green-700 text-xs dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                          Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Role Management</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={user.role === "admin"}
                          onClick={() =>
                            setRoleMutation.mutate({
                              userId: user.id,
                              role: "admin",
                            })
                          }
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "user" || !user.role}
                          onClick={() =>
                            setRoleMutation.mutate({
                              userId: user.id,
                              role: "user",
                            })
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Access Control</DropdownMenuLabel>
                        {user.banned ? (
                          <DropdownMenuItem
                            className="text-green-600 focus:text-green-600"
                            onClick={() =>
                              unbanUserMutation.mutate({ userId: user.id })
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() =>
                              banUserMutation.mutate({ userId: user.id })
                            }
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
