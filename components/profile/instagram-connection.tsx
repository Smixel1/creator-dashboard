"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/components/settings/settings-ui";
import { useTranslations } from "@/components/providers/locale-provider";
import { useFormatters } from "@/hooks/use-formatters";
import type { InstagramConnectionPublic } from "@/types/instagram";
import { cn } from "@/lib/utils";

interface InstagramConnectionPanelProps {
  connection: InstagramConnectionPublic;
}

export function InstagramConnectionPanel({
  connection: initialConnection,
}: InstagramConnectionPanelProps) {
  const t = useTranslations();
  const { formatDate } = useFormatters();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState(initialConnection);
  const [busy, setBusy] = useState<"connect" | "sync" | "disconnect" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const callbackStatus = searchParams.get("instagram");

  const statusMessage = useMemo(() => {
    switch (callbackStatus) {
      case "connected":
        return t("instagram.connectedSuccess");
      case "professional_required":
        return t("instagram.professionalRequired");
      case "access_denied":
        return t("instagram.accessDenied");
      case "session_required":
        return t("instagram.sessionRequired");
      case "rate_limited":
        return t("instagram.rateLimited");
      case "oauth_failed":
        return t("instagram.connectionFailed");
      default:
        return null;
    }
  }, [callbackStatus, t]);

  const isConnected = connection.status === "connected";
  const isExpired = connection.status === "expired";
  const canConnect = connection.configured && !isConnected && !isExpired;

  const handleConnect = useCallback(() => {
    setError(null);
    setBusy("connect");
    router.push("/api/instagram/connect");
  }, [router]);

  const handleSync = useCallback(async () => {
    setError(null);
    setSyncSuccess(null);
    setBusy("sync");

    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? t("instagram.syncFailed"));
        return;
      }

      const reelsTotal =
        (body.reelsCreated ?? 0) + (body.reelsUpdated ?? 0) ||
        body.mediaPrepared ||
        0;

      setSyncSuccess(
        t("instagram.syncSuccessReels", {
          reels: String(reelsTotal),
          created: String(body.reelsCreated ?? 0),
          updated: String(body.reelsUpdated ?? 0),
        })
      );

      setConnection((prev) => ({
        ...prev,
        status: "connected",
        followersCount: body.followersCount ?? prev.followersCount,
        lastSyncedAt: body.lastSyncedAt ?? prev.lastSyncedAt,
      }));
      router.refresh();
    } catch {
      setError(t("instagram.syncFailed"));
    } finally {
      setBusy(null);
    }
  }, [router, t]);

  const handleDisconnect = useCallback(async () => {
    setError(null);
    setBusy("disconnect");

    try {
      const res = await fetch("/api/instagram/disconnect", { method: "POST" });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? t("instagram.disconnectFailed"));
        return;
      }

      setConnection({
        status: "not_connected",
        configured: connection.configured,
      });
      router.refresh();
    } catch {
      setError(t("instagram.disconnectFailed"));
    } finally {
      setBusy(null);
    }
  }, [connection.configured, router, t]);

  const statusValue = isConnected
    ? t("instagram.connected")
    : isExpired
      ? t("instagram.connectionExpired")
      : t("instagram.notConnected");

  const usernameValue = connection.username
    ? `@${connection.username}`
    : t("instagram.notConnected");

  return (
    <section className="open-section pt-6 border-t border-border/25 max-w-lg space-y-4">
      <div>
        <h2 className="section-title">{t("common.instagram")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("instagram.sectionDesc")}
        </p>
      </div>

      <div className="surface-soft rounded-xl overflow-hidden border border-border/25">
        <SettingsRow label={t("common.instagram")} value={usernameValue} />
        <SettingsRow label={t("settings.connectionStatus")} value={statusValue} />
        {connection.lastSyncedAt && (
          <SettingsRow
            label={t("instagram.lastSynced")}
            value={formatDate(connection.lastSyncedAt)}
          />
        )}
      </div>

      {!connection.configured && (
        <p className="text-sm text-muted-foreground">{t("instagram.notConfigured")}</p>
      )}

      {isExpired && (
        <p className="text-sm text-destructive">{t("instagram.connectionExpired")}</p>
      )}

      {statusMessage && (
        <p
          className={cn(
            "text-sm",
            callbackStatus === "connected"
              ? "text-brand-sage"
              : "text-destructive"
          )}
        >
          {statusMessage}
        </p>
      )}

      {syncSuccess && (
        <p className="text-sm text-brand-sage">{syncSuccess}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {canConnect && (
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={busy !== null}
          >
            {busy === "connect" ? t("instagram.connecting") : t("instagram.connect")}
          </Button>
        )}

        {isExpired && connection.configured && (
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={busy !== null}
          >
            {busy === "connect"
              ? t("instagram.connecting")
              : t("instagram.reconnect")}
          </Button>
        )}

        {isConnected && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={busy !== null}
            >
              {busy === "sync" ? t("instagram.syncing") : t("instagram.sync")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              disabled={busy !== null}
            >
              {busy === "disconnect"
                ? t("common.loading")
                : t("instagram.disconnect")}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
