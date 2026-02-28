import { DataLoader } from "@/components/providers/DataLoader";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataLoader>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </DataLoader>
  );
}
