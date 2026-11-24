/** A date that may be only partly known (often just the year), in either calendar. */
export interface FamilyDate {
  /** 's' = dương lịch (solar), 'l' = âm lịch (lunar) */
  cal: 's' | 'l';
  y?: number;
  m?: number;
  d?: number;
  /** lunar only: tháng nhuận */
  leap?: boolean;
}

export type Gender = 'm' | 'f' | 'u';

export interface Person {
  name: string;
  gender: Gender;
  /** @deprecated typed-in "đời thứ" of older data; now computed (see generations.ts).
   *  Still read once to keep a family's numbering when moving to the computed one. */
  generation?: number;
  deceased?: boolean;
  birth?: FamilyDate;
  /** ngày mất — giỗ is computed from this when it's lunar */
  death?: FamilyDate;
  fatherId?: string;
  motherId?: string;
  spouses?: Record<string, true>;
  /** thứ tự con trong nhà (con trưởng = 1) */
  order?: number;
  note?: string;
  /** nơi ở — free text, e.g. "Hoài Nhơn, Bình Định" */
  place?: string;
  updatedAt?: number;
}

export interface FamilyMeta {
  name: string;
  owner: string;
  createdAt: number;
  /** "đời thứ" of the top of the main line (1 unless this is a branch of a bigger clan) */
  topGeneration?: number;
}

export interface Family {
  meta: FamilyMeta;
  admins: Record<string, true>;
  people?: Record<string, Person>;
}
