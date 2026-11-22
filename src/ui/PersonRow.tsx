import { useNavigate } from 'react-router-dom';
import { lifespan } from '../data/people';
import type { Person } from '../data/types';

export const GENDER_ICON: Record<Person['gender'], string> = { m: '👨', f: '👩', u: '🧑' };

/** One tappable line for a person: icon, name, years. */
export function PersonRow({ id, person, label }: { id: string; person: Person; label?: string }) {
  const navigate = useNavigate();
  const years = lifespan(person);
  return (
    <button
      className={`person-row${person.deceased ? ' deceased' : ''}`}
      data-testid={`person-${id}`}
      onClick={() => navigate(`/p/${id}`)}
    >
      <span className="avatar" aria-hidden>
        {GENDER_ICON[person.gender]}
      </span>
      <span className="grow">
        <span className="name">{person.name}</span>
        {(label || years) && (
          <span className="sub">{[label, years].filter(Boolean).join(' · ')}</span>
        )}
      </span>
      <span aria-hidden className="chev">
        ›
      </span>
    </button>
  );
}
