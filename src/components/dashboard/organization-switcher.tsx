"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export function OrganizationSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchOrganization = async (organizationId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const selectedOrg = session?.user.organizations.find(
        (org) => org.organization.id === organizationId
      );

      if (!selectedOrg) {
        toast.error("Organizasyon bulunamadı");
        return;
      }

      // Session'ı güncelle
      await update({
        activeOrganizationId: organizationId,
        activeOrganization: {
          id: selectedOrg.organization.id,
          name: selectedOrg.organization.name,
          slug: selectedOrg.organization.slug,
          role: selectedOrg.role,
        },
      });

      toast.success(`${selectedOrg.organization.name} organizasyonuna geçildi`);
      router.refresh();
    } catch (error) {
      toast.error("Organizasyon değiştirilirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.activeOrganization) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <span className="truncate">
              {session.user.activeOrganization.name}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Organizasyonlar</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {session.user.organizations.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            onClick={() => handleSwitchOrganization(membership.organization.id)}
            className="flex items-center justify-between cursor-pointer"
            disabled={isLoading}
          >
            <div className="flex items-center flex-1">
              <div className="flex flex-col">
                <span className="font-medium">
                  {membership.organization.name}
                </span>
                <span className="text-xs text-gray-500">
                  @{membership.organization.slug}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  membership.role === "ADMIN"
                    ? "default"
                    : membership.role === "EDITOR"
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {membership.role}
              </Badge>
              {session.user.activeOrganization?.id ===
                membership.organization.id && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/organizations/create")}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Organizasyon Oluştur
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
