// src/app/dashboard/institution-admin/placements/page.tsx
import PlacementsPortalClient from "@/components/placements/placements-portal-client";

export default function InstitutionAdminPlacementsPage() {
  return <PlacementsPortalClient role="institution_admin" defaultTab="overview" />;
}
