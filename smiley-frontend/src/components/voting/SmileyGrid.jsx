import SmileyButton from './SmileyButton.jsx';

export default function SmileyGrid({ ratings, onSelect }) {
  return (
    <div className="smiley-grid">
      {ratings.map(rating => <SmileyButton key={rating.id} rating={rating} onSelect={onSelect} />)}
    </div>
  );
}
