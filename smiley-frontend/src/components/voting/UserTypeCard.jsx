const icons = {
  Student: String.fromCodePoint(0x1f393),
  'Faculty / Employee': String.fromCodePoint(0x1f4bc),
  Alumni: String.fromCodePoint(0x1f91d),
  Others: String.fromCodePoint(0x2728),
};

export default function UserTypeCard({ userType, onSelect }) {
  return (
    <button className="user-type-choice" type="button" onClick={() => onSelect(userType)}>
      <span className="user-type-choice-icon" aria-hidden="true">{icons[userType.name] || String.fromCodePoint(0x1f464)}</span>
      <strong>{userType.name}</strong>
    </button>
  );
}