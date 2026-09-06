import { executeGlobalErpSearchAction, SearchResultItem } from "@/app/actions/global-search-actions";

export type { SearchResultItem };

export const GlobalSearchEngine = {
  /**
   * Search across all ERP entities dynamically via live database query
   */
  search: async (query: string, campusId?: string): Promise<SearchResultItem[]> => {
    if (!query || query.trim().length < 2) return [];
    const res = await executeGlobalErpSearchAction(query);
    return res.success ? res.results : [];
  },
};
