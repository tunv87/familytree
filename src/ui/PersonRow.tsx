import { useNavigate } from 'react-router-dom';
import { lifespan } from '../data/people';
import type { Person } from '../data/types';
import { Avatar } from './Avatar';

/** One tappable line for a person: photo (or default picture), name, years, where they live. */
export function PersonRow({ id, person, label }: { id: string; person: Person; label?: string }) {
  const navigate = useNavigate();
  const years = lifespan(person);
  return (
    <button
      className={`person-row${person.deceased ? ' deceased' : ''}`}
      data-testid={`person-${id}`}
      onClick={() => navigate(`/p/${id}`)}
    >
      <Avatar id={id} person={person} />
      <span className="grow">
        <span className="name">{person.name}</span>
        {(label || years || person.place) && (
          <span className="sub">{[label, years, person.place].filter(Boolean).join(' · ')}</span>
        )}
      </span>
      <span aria-hidden className="chev">
        ›
      </span>
    </button>
  );
}
