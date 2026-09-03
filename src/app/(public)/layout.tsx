import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EmergencyBanner from "@/components/layout/EmergencyBanner";
import { PublicVaniWidget } from "@/components/vani-public/PublicVaniWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <EmergencyBanner />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <PublicVaniWidget />
    </div>
  );
}
