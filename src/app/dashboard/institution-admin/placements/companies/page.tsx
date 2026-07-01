// src/app/dashboard/institution-admin/placements/companies/page.tsx
import PlacementsPortalClient from "@/components/placements/placements-portal-client";

export default function InstitutionAdminPlacementsCompaniesPage() {
  return <PlacementsPortalClient role="institution_admin" defaultTab="companies" />;
}
