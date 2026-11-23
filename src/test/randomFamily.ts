import type { People } from '../data/people';
import type { Person } from '../data/types';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});

/** Random family: a founding couple, then children, in-laws (some with their own parents). */
export function randomFamily(size: number, seed: number): People {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const people: People = {
    p0: P('Tổ', 'm', { spouses: { p1: true } }),
    p1: P('Bà Tổ', 'f', { spouses: { p0: true } }),
  };
  const blood = ['p0'];
  let n = 2;
  while (n < size) {
    const parent = blood[Math.floor(rnd() * blood.length)];
    const id = `p${n++}`;
    const male = rnd() < 0.5;
    const spouse = Object.keys(people[parent].spouses ?? {})[0];
    people[id] = P(id, male ? 'm' : 'f', {
      fatherId: people[parent].gender === 'm' ? parent : spouse,
      motherId: people[parent].gender === 'm' ? spouse : parent,
    });
    blood.push(id);
    if (rnd() < 0.6 && n < size) {
      const w = `p${n++}`;
      people[w] = P(w, male ? 'f' : 'm', { spouses: { [id]: true } });
      people[id].spouses = { [w]: true };
      if (rnd() < 0.3 && n + 1 < size) {
        // the in-law's own parents are recorded too
        const f = `p${n++}`;
        people[f] = P(f, 'm');
        people[w].fatherId = f;
      }
    }
  }
  return people;
}
