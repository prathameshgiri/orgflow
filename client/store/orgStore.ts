import { create } from 'zustand';

interface OrgState {
  activeOrganizationId: string | null;
  setActiveOrganizationId: (id: string | null) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  activeOrganizationId: null,
  setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),
}));
