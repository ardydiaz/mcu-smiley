const icons = {
  Student: 'ST',
  'Faculty / Employee': 'FE',
  Alumni: 'AL',
  Others: 'OT',
};

export default function UserTypeCard({ userType, onSelect }) {
  return (
    <button className="department-card user-type-card" type="button" onClick={() => onSelect(userType)}>
      <span className="department-icon user-type-icon" aria-hidden="true">{icons[userType.name] || userType.name.slice(0, 2).toUpperCase()}</span>
      <span className="department-copy">
        <strong>{userType.name}</strong>
        <span>Continue as {userType.name}</span>
      </span>
      <span className="user-type-check" aria-hidden="true"></span>
    </button>
  );
}
