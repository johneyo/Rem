/** A partial date: imported birthdays often have no year (vCard `--MMDD`, Google "--03-14"). */
export interface PartialDate {
  year?: number;
  month: number;
  day: number;
}

export interface ImportedContact {
  displayName: string;
  emails: string[];
  phones: string[];
  birthday?: PartialDate;
  anniversary?: PartialDate;
  notes?: string;
  /** Labels / groups from the source, used to guess a Circle. */
  labels: string[];
  sourceRef?: string;
}
