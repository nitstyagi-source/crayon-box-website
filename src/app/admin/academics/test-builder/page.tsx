import { Metadata } from 'next';
import { BloomsTestBuilderStudio } from '@/components/innovations/BloomsTestBuilderStudio';

export const metadata: Metadata = {
  title: "Bloom's Taxonomy Test Builder | Crayon Box ERP",
  description: 'Automated test blueprinting and examination paper generator.',
};

export default function AdminAcademicsTestBuilderPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <BloomsTestBuilderStudio />
    </div>
  );
}
