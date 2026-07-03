import type { Application, Status } from "../types";
import { IN_RUNNING_STATUSES } from "../constants";

export interface LedgerStats {
  total: number;
  inRunning: number;
  interviews: number;
  offers: number;
  /** 0–100, rounded. Replies / decisions over everything actually sent out. */
  responseRate: number;
}

function count(apps: Application[], statuses: Status[]): number {
  const set = new Set(statuses);
  return apps.filter((a) => set.has(a.status)).length;
}

/**
 * Live dashboard figures for a given set of applications (typically one
 * pipeline). Response rate = (Interview + Accepted + Rejected) / (non-Wishlist).
 */
export function computeStats(apps: Application[]): LedgerStats {
  const total = apps.length;
  const inRunning = count(apps, IN_RUNNING_STATUSES);
  const interviews = count(apps, ["Interview"]);
  const offers = count(apps, ["Accepted"]);

  const nonWishlist = apps.filter((a) => a.status !== "Wishlist").length;
  const responded = count(apps, ["Interview", "Accepted", "Rejected"]);
  const responseRate =
    nonWishlist === 0 ? 0 : Math.round((responded / nonWishlist) * 100);

  return { total, inRunning, interviews, offers, responseRate };
}
