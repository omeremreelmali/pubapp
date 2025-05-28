"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, UserPlus, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  expiresAt: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const inviteCode = params.inviteCode as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation();
    }
  }, [inviteCode]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${inviteCode}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Davet bulunamadı");
        return;
      }

      setInvitation(data.invitation);
    } catch (error) {
      setError("Davet yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!session?.user) {
      // Kullanıcı giriş yapmamış, giriş sayfasına yönlendir
      signIn(undefined, { callbackUrl: `/invite/${inviteCode}` });
      return;
    }

    setIsAccepting(true);
    try {
      const response = await fetch(`/api/invitations/${inviteCode}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Davet kabul edilirken hata oluştu");
        return;
      }

      // Session'ı güncelle
      const newOrganization = {
        id: data.membershipId,
        role: data.role,
        organization: {
          id: invitation!.organization.id,
          name: invitation!.organization.name,
          slug: invitation!.organization.slug,
        },
      };

      await update({
        organizations: [...(session.user.organizations || []), newOrganization],
        activeOrganizationId: invitation!.organization.id,
        activeOrganization: {
          id: invitation!.organization.id,
          name: invitation!.organization.name,
          slug: invitation!.organization.slug,
          role: data.role,
        },
      });

      toast.success(
        `${invitation!.organization.name} organizasyonuna başarıyla katıldınız!`
      );
      router.push("/dashboard");
    } catch (error) {
      setError("Davet kabul edilirken hata oluştu");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Davet yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Davet Bulunamadı
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {error || "Bu davet geçersiz veya süresi dolmuş olabilir"}
              </p>
              <Link href="/auth/signin">
                <Button>Giriş Yap</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle>Organizasyon Daveti</CardTitle>
            <CardDescription>
              {invitation.organization.name} organizasyonuna davet edildiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Organizasyon:</span>
                <span>{invitation.organization.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Rol:</span>
                <Badge
                  variant={
                    invitation.role === "ADMIN"
                      ? "default"
                      : invitation.role === "EDITOR"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {invitation.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-sm text-gray-600">
                  {invitation.email}
                </span>
              </div>
            </div>

            {invitation.organization.description && (
              <div>
                <h4 className="font-medium mb-2">Organizasyon Hakkında</h4>
                <p className="text-sm text-gray-600">
                  {invitation.organization.description}
                </p>
              </div>
            )}

            {session?.user ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {session.user.email} olarak giriş yaptınız. Daveti kabul
                    etmek için aşağıdaki butona tıklayın.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isAccepting}
                  className="w-full"
                >
                  {isAccepting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Daveti Kabul Et
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Daveti kabul etmek için önce giriş yapmanız gerekiyor.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => signIn()} className="w-full">
                  Giriş Yap ve Daveti Kabul Et
                </Button>
                <div className="text-center">
                  <Link
                    href="/auth/signup"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Hesabınız yok mu? Kayıt olun
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
