/**
 * GLOBAL ERP SEARCH ENGINE (Cmd + K)
 * Fast multi-entity search across Students, Families, Staff, Invoices, Fee Receipts, and Campus Assets.
 */

export interface SearchResultItem {
  id: string;
  type: 'STUDENT' | 'FAMILY' | 'STAFF' | 'INVOICE' | 'RECEIPT' | 'ASSET' | 'INCIDENT';
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  badgeColor: string;
}

export const GlobalSearchEngine = {
  /**
   * Search across all ERP entities
   */
  search: async (query: string, campusId?: string): Promise<SearchResultItem[]> => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // 1. Match Sample Students
    if ('aarav sharma'.includes(q) || 'adm-2026-042'.includes(q) || 'grade 4'.includes(q)) {
      results.push({
        id: 'std-001',
        type: 'STUDENT',
        title: 'Aarav Sharma',
        subtitle: 'Grade 4-B • ADM-2026-042 • Sibling: Anaya Sharma',
        route: '/admin/students/std-001',
        badge: 'Active Student',
        badgeColor: 'emerald',
      });
    }

    if ('anaya sharma'.includes(q) || 'adm-2026-043'.includes(q) || 'grade 1'.includes(q)) {
      results.push({
        id: 'std-002',
        type: 'STUDENT',
        title: 'Anaya Sharma',
        subtitle: 'Grade 1-A • ADM-2026-043 • Sibling: Aarav Sharma',
        route: '/admin/students/std-002',
        badge: 'Active Student',
        badgeColor: 'emerald',
      });
    }

    // 2. Match Family Master
    if ('sharma family'.includes(q) || 'fam-2026-012'.includes(q) || 'pooja sharma'.includes(q)) {
      results.push({
        id: 'fam-012',
        type: 'FAMILY',
        title: 'Sharma Family (Pooja & Rajesh Sharma)',
        subtitle: 'FAM-2026-012 • 2 Enrolled Children (Aarav, Anaya) • +91 98100 12345',
        route: '/admin/families/fam-012',
        badge: 'Family 360°',
        badgeColor: 'purple',
      });
    }

    // 3. Match Faculty / Staff
    if ('meenakshi sundaram'.includes(q) || 'emp-042'.includes(q) || 'math'.includes(q)) {
      results.push({
        id: 'stf-042',
        type: 'STAFF',
        title: 'Dr. Meenakshi Sundaram',
        subtitle: 'Senior Faculty • Mathematics Lead • EMP-042',
        route: '/admin/hr',
        badge: 'Faculty',
        badgeColor: 'blue',
      });
    }

    // 4. Match Invoices & Financials
    if ('inv-2026-005421'.includes(q) || 'fee'.includes(q) || 'invoice'.includes(q)) {
      results.push({
        id: 'inv-005421',
        type: 'INVOICE',
        title: 'Invoice #INV-2026-005421',
        subtitle: 'Aarav Sharma • ₹40,200 (Quarter 2 Tuition & Transport) • PAID',
        route: '/admin/finance',
        badge: 'Invoice (Paid)',
        badgeColor: 'emerald',
      });
    }

    // 5. Match Incidents
    if ('incident'.includes(q) || 'inc-2026'.includes(q) || 'bullying'.includes(q)) {
      results.push({
        id: 'inc-001',
        type: 'INCIDENT',
        title: 'Dispute during lunch break (#INC-2026-001)',
        subtitle: 'Classroom 4B • Minor Severity • Pastoral Follow-Up Complete',
        route: '/admin/incidents',
        badge: 'Incident',
        badgeColor: 'amber',
      });
    }

    return results;
  },
};
