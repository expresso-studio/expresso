import { Suspense } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

function LoadingUsers() {
  return <div>Loading users...</div>;
}

async function getUsers() {
  try {
    const res = await fetch("http://localhost:3000/api/users", {
      cache: "no-store", // Disable caching for real-time data
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
// Main component using React Server Components
export default async function UsersPage() {
  const users: User[] = await getUsers();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>
      <Suspense fallback={<LoadingUsers />}>
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="border p-4 rounded-lg shadow">
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              {/* Add more user fields as needed */}
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
