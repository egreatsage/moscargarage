
import StaffForm from '../StaffForm';

export default function NewServicePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Staff Member</h1>
          <p className="text-sm text-gray-600 mt-1">Fill out the details for the new staff member.</p>
        </div>  
        <StaffForm />
      </div>
    </div>
  );
}