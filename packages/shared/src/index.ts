/**
 * A shared status type for various operations.
 */
export type Status = "pending" | "completed" | "failed";

/**
 * A shared user type.
 */
export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
}
