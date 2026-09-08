import UserTypeCard from './UserTypeCard.jsx';

export default function UserTypeGrid({ userTypes, onSelect }) {
  return (
    <div className="user-type-grid">
      {userTypes.map(userType => <UserTypeCard key={userType.id} userType={userType} onSelect={onSelect} />)}
    </div>
  );
}
