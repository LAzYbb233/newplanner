import { BottomNav } from "@/components/layout/BottomNav";
import { DataLoader } from "@/components/providers/DataLoader";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataLoader>
      <main className="flex-1 pb-20 md:pb-24">{children}</main>
      <BottomNav />
    </DataLoader>
  );
}
