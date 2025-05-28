"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function InviteUserDialog() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "TESTER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!session?.user?.activeOrganization) {
      setError("Aktif organizasyon bulunamadı");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/organizations/${session.user.activeOrganization.id}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Bir hata oluştu");
      } else {
        setSuccess("Davet başarıyla gönderildi!");
        setInviteUrl(data.invitation.inviteUrl);
        setFormData({ email: "", role: "TESTER" });
        toast.success("Kullanıcı başarıyla davet edildi!");
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Davet linki kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Kopyalama başarısız");
    }
  };

  const resetForm = () => {
    setFormData({ email: "", role: "TESTER" });
    setError("");
    setSuccess("");
    setInviteUrl("");
    setCopied(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Kullanıcı Davet Et
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Davet Et</DialogTitle>
          <DialogDescription>
            Organizasyonunuza yeni bir kullanıcı davet edin
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="kullanici@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="TESTER">Tester</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                <strong>Admin:</strong> Tüm yetkilere sahip
                <br />
                <strong>Editor:</strong> Uygulama ekleme/düzenleme
                <br />
                <strong>Tester:</strong> Sadece görüntüleme ve indirme
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Davet Gönder
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Davet Linki</Label>
              <div className="flex space-x-2">
                <Input value={inviteUrl} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyInviteLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Bu linki davet etmek istediğiniz kişiye gönderin
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Kapat
              </Button>
              <Button type="button" onClick={resetForm}>
                Yeni Davet
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
