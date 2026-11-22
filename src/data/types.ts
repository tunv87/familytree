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
  /** đời thứ (1 = thủy tổ) */
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
  updatedAt?: number;
}

export interface FamilyMeta {
  name: string;
  owner: string;
  createdAt: number;
}

export interface Family {
  meta: FamilyMeta;
  admins: Record<string, true>;
  people?: Record<string, Person>;
}
