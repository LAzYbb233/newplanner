import { BottomNav } from "@/components/layout/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 pb-20 md:pb-24">{children}</main>
      <BottomNav />
    </>
  );
}
