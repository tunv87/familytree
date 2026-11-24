import { usePhoto, useThumbs } from '../data/photos';
import type { Person } from '../data/types';

/** Default picture when there is no photo (kiểu 1 · hình người, chosen on the mock). */
export const GENDER_ICON: Record<Person['gender'], string> = { m: '👨', f: '👩', u: '🧑' };

/** Small round photo for lists, or the default picture. The name is always shown next to it,
 *  so the image itself is decorative. */
export function Avatar({ id, person }: { id: string; person: Person }) {
  const thumb = useThumbs()[id];
  return <AvatarView src={thumb} person={person} id={id} />;
}

/** The big photo at the top of a person's page. */
export function BigAvatar({ id, person }: { id: string; person: Person }) {
  const photo = usePhoto(id);
  return <AvatarView src={photo} person={person} id={id} big />;
}

function AvatarView({
  src,
  person,
  id,
  big,
}: {
  src: string | null | undefined;
  person: Person;
  id: string;
  big?: boolean;
}) {
  const cls = `avatar${big ? ' big' : ''}`;
  if (src)
    return (
      <img
        className={`${cls} photo`}
        src={src}
        alt=""
        data-testid={big ? 'photo-big' : `photo-${id}`}
        draggable={false}
      />
    );
  return (
    <span className={cls} aria-hidden data-testid={big ? 'avatar-default' : undefined}>
      {GENDER_ICON[person.gender]}
    </span>
  );
}
