"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  AVATAR_ACCEPT,
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_MAX_SIZE_MB,
} from "@/lib/avatar/constants";

interface AvatarUploadProps {
  name: string;
  avatarUrl: string | null;
  onAvatarUpdated?: (avatarUrl: string) => void;
}

function withCacheBust(url: string, version: number) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${version}`;
}

export function AvatarUpload({
  name,
  avatarUrl: initialAvatarUrl,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const router = useRouter();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = uploadedUrl ?? initialAvatarUrl;

  function resetSelection() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleClose() {
    if (isUploading) return;
    resetSelection();
    setOpen(false);
  }

  function validateClientFile(file: File): string | null {
    if (
      !AVATAR_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return t("profile.invalidImageType");
    }

    if (file.size > AVATAR_MAX_BYTES) {
      return t("profile.imageTooLarge", { max: AVATAR_MAX_SIZE_MB });
    }

    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateClientFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const validationError = validateClientFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (body as { error?: string }).error ?? t("profile.uploadError")
        );
        return;
      }

      const nextUrl = (body as { avatarUrl?: string }).avatarUrl;
      if (!nextUrl) {
        setError(t("profile.uploadError"));
        return;
      }

      setUploadedUrl(nextUrl);
      setCacheVersion((value) => value + 1);
      onAvatarUpdated?.(nextUrl);
      resetSelection();
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("profile.uploadNetworkError"));
    } finally {
      setIsUploading(false);
    }
  }

  const displayUrl = preview
    ? preview
    : avatarUrl
      ? withCacheBust(avatarUrl, cacheVersion)
      : undefined;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="relative group">
        <Avatar className="h-20 w-20 ring-2 ring-border/30">
          <AvatarImage src={displayUrl} alt={name} />
          <AvatarFallback className="text-2xl font-semibold">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Camera className="h-3.5 w-3.5" />
        {t("profile.changePhoto")}
      </Button>

      <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("profile.photoTitle")}</DialogTitle>
            <DialogDescription>{t("profile.photoDesc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={displayUrl} alt={name} />
              <AvatarFallback className="text-2xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <input
              ref={inputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {t("profile.chooseImage")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t("profile.photoRequirements", { max: AVATAR_MAX_SIZE_MB })}
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive text-center">
                {error}
              </p>
            )}
          </div>
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("profile.uploading")}
                </>
              ) : (
                t("profile.savePhoto")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
