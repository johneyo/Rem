import Constants from "expo-constants";
import { Platform } from "react-native";

export type OccasionType =
  | "birthday"
  | "wedding_anniversary"
  | "dating_anniversary"
  | "work_anniversary"
  | "graduation"
  | "new_baby"
  | "new_job"
  | "retirement"
  | "housewarming"
  | "memorial"
  | "custom";

export interface UpcomingItem {
  momentId: string;
  occursOn: string;
  daysAway: number;
  personId: string;
  personName: string;
  occasionType: OccasionType;
  label: string | null;
  years: number | null;
  milestone: boolean;
}

export interface Person {
  id: string;
  displayName: string;
  completeness: number;
  occasions: { id: string; type: OccasionType; month: number; day: number; year: number | null }[];
}

/**
 * The web app's address. EXPO_PUBLIC_API_URL wins; otherwise use the machine Metro runs on
 * (so a phone on the same network reaches it), port 3000.
 */
export function apiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (Platform.OS === "web" && typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:3000`;
  const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${host}:3000`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  upcoming: () => request<{ timezone: string; peopleCount: number; items: UpcomingItem[] }>("/api/upcoming"),
  people: () => request<{ people: Person[] }>("/api/people"),
  addPerson: (input: { displayName: string; email: string; phone: string; day: string; month: string; year: string }) =>
    request<{ id: string; displayName: string }>("/api/people", { method: "POST", body: JSON.stringify(input) }),
  markDone: (momentId: string) => request<{ ok: true }>(`/api/moments/${momentId}/done`, { method: "POST" }),
};
