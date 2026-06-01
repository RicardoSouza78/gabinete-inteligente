import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 max-w-7xl mx-auto flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
