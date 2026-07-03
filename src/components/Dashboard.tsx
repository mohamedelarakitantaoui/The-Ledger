import type { LedgerStats } from "../utils/stats";
import { StatCard } from "./StatCard";

interface Props {
  stats: LedgerStats;
  pipelineLabel: string;
}

/**
 * Live figures for the active pipeline. Hairline dividers, no boxes —
 * the numbers do the talking.
 */
export function Dashboard({ stats, pipelineLabel }: Props) {
  return (
    <section
      aria-label="Overview"
      className="grid grid-cols-2 gap-x-6 divide-line border-y border-line lg:grid-cols-5 lg:divide-x"
    >
      <StatCard label="Logged" value={stats.total} hint={pipelineLabel} />
      <StatCard
        label="In the running"
        value={stats.inRunning}
        hint="applied · pending · interview"
      />
      <StatCard label="Interviews" value={stats.interviews} hint="reached the table" />
      <StatCard label="Offers" value={stats.offers} accent hint="accepted" />
      <StatCard
        label="Response rate"
        value={`${stats.responseRate}%`}
        hint="of everything sent"
      />
    </section>
  );
}
