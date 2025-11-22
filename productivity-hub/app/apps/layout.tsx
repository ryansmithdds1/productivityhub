import { DashboardLayout } from '../components/DashboardLayout';

export default function AppsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
