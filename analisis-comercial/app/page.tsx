import { ReportDashboard } from "@/app/components/report-dashboard";
import { getInitialDashboardData } from "@/app/lib/report-data";

export default function Home() {
  const initialData = getInitialDashboardData();
  return <ReportDashboard initialData={initialData} />;
}
