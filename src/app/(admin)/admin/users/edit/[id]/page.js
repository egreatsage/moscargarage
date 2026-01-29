import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import UserForm from "../../UserForm";

// Helper to fetch data
async function getUser(id) {
    await connectDB();
    const user = await User.findById(id).select('-password');
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
}

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">User Not Found</h2>
        <p className="text-gray-600 mt-2">The user you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UserForm user={user} isNew={false} />
    </div>
  );
}