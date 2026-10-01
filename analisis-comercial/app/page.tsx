import { ReportDashboard } from "@/app/components/report-dashboard";
import { getDashboardData } from "@/app/lib/report-data";

export default function Home() {
  const data = getDashboardData();
  return <ReportDashboard data={data} />;
}
