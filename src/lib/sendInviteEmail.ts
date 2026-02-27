export async function sendInviteEmail({
  to,
  projectName,
  inviterName,
  roleLabel,
  acceptUrl,
}: {
  to: string;
  projectName: string;
  inviterName: string;
  roleLabel: string;
  acceptUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email service configured — the invite link will be shown in the UI instead
    console.log(`[NoCarry Invite] No RESEND_API_KEY set. Invite link:\n${acceptUrl}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "NoCarry <onboarding@resend.dev>";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#0f0f0f;color:#fff;border-radius:12px">
      <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">You've been invited!</h1>
      <p style="color:#9ca3af;font-size:15px;margin:0 0 28px;line-height:1.6">
        <strong style="color:#fff">${inviterName}</strong> has invited you to join
        <strong style="color:#fff">${projectName}</strong> as a
        <strong style="color:#fff">${roleLabel}</strong>.
      </p>
      <a
        href="${acceptUrl}"
        style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.01em"
      >
        Accept Invite →
      </a>
      <p style="color:#4b5563;font-size:12px;margin-top:32px;line-height:1.5">
        This invite link expires in 7 days.<br>
        If you didn't expect this, you can safely ignore it.
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${inviterName} invited you to join ${projectName} on NoCarry`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[NoCarry Invite] Resend error:", body);
  }
}
