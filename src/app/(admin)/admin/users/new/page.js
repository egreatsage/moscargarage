import UserForm from '../UserForm';

export default function NewUserPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UserForm isNew={true} />
    </div>
  );
}