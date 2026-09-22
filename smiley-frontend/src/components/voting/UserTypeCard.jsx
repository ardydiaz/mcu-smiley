import { Briefcase, GraduationCap, Handshake, User } from 'lucide-react';

const icons = {
  Guest: User,
  Student: GraduationCap,
  'Faculty / Employee': Briefcase,
  Alumni: Handshake,
};

export default function UserTypeCard({ userType, onSelect }) {
  const Icon = icons[userType.name] || User;
  return (
    <button className="user-type-choice" type="button" onClick={() => onSelect(userType)}>
      <span className="user-type-choice-icon" aria-hidden="true"><Icon /></span>
      <strong>{userType.name}</strong>
    </button>
  );
}
