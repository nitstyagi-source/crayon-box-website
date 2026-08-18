export const metadata = {
  title: 'Smart Visitor Kiosk - Crayon Box',
  description: 'Self-service check-in kiosk for visitors.',
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-sans text-slate-800 selection:bg-blue-500 selection:text-white flex flex-col">
      {/* 
        This layout is meant for a Landscape iPad.
        We hide scrollbars and use the full height/width.
      */}
      <main className="flex-1 bg-white relative flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
