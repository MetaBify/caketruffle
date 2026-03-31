import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createShortLink,
  deleteShortLink,
  listShortLinks,
} from "@/lib/shortlinks";
import {
  createSessionToken,
  getCookieName,
  verifySessionToken,
} from "@/lib/auth";
import {
  getClientMeta,
  isIpLocked,
  recordFailedAttempt,
  recordLoginEvent,
  recordSuccessfulLogin,
  storeSession,
} from "@/lib/admin";
import AdSlot from "@/components/AdSlot";
import { normalizeLang, t } from "@/lib/i18n";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ImageUploadPreview from "@/components/ImageUploadPreview";
import FormSubmit from "@/components/FormSubmit";

type AdminPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

async function loginAction(formData: FormData) {
  "use server";
  const { ip, userAgent } = await getClientMeta();
  if (await isIpLocked(ip)) {
    redirect("/admin?error=Too%20many%20attempts.%20Try%20later.");
  }

  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const success = Boolean(adminPassword && password === adminPassword);
  await recordLoginEvent(ip, success);

  if (!success) {
    await recordFailedAttempt(ip);
    redirect("/admin?error=Invalid%20password");
  }

  await recordSuccessfulLogin(ip);
  const cookieStore = await cookies();
  const token = createSessionToken();
  cookieStore.set(getCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  await storeSession(token, ip, userAgent);
  redirect("/admin?success=Logged%20in");
}

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set(getCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin");
}

async function createLinkAction(formData: FormData) {
  "use server";
  try {
    const imageFile = formData.get("imageFile");
    let imageUrl = String(formData.get("imageUrl") ?? "");
    const imageAspect = String(formData.get("imageAspect") ?? "square");

    if (imageFile instanceof File && imageFile.size > 0) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowed.includes(imageFile.type)) {
        throw new Error("Unsupported image type.");
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("Image too large (max 5MB).");
      }
      imageUrl = await uploadToCloudinary(imageFile, {
        aspect: imageAspect === "landscape" ? "landscape" : "square",
      });
    }

    await createShortLink({
      code: String(formData.get("code") ?? ""),
      title: String(formData.get("title") ?? ""),
      targetUrl: String(formData.get("targetUrl") ?? ""),
      imageUrl,
      description: String(formData.get("description") ?? ""),
      waitSeconds: Number(formData.get("waitSeconds") ?? 600),
      requireOfferWall: Boolean(formData.get("requireOfferWall")),
      s1: String(formData.get("s1") ?? ""),
      s2: String(formData.get("s2") ?? ""),
    });
    revalidatePath("/admin");
    redirect("/admin?success=Link%20created");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create link";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
}

async function deleteLinkAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteShortLink(id);
  }
  revalidatePath("/admin");
  redirect("/admin?success=Link%20deleted");
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  const token = cookieStore.get(getCookieName())?.value;
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const isAuthed = verifySessionToken(token);

  if (!isAuthed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-10 shadow-[var(--shadow)]">
          <h1 className="text-2xl font-semibold">{t(lang, "adminTitle")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Enter the admin password to manage short links.
          </p>
          <form action={loginAction} className="mt-6 space-y-4">
            <input
              type="password"
              name="password"
              placeholder="Admin password"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
              required
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)]"
            >
              {t(lang, "login")}
            </button>
          </form>
          {resolvedSearchParams?.error ? (
            <p className="mt-4 text-sm text-[color:var(--accent-3)]">
              {resolvedSearchParams.error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const links = await listShortLinks();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t(lang, "adminTitle")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Create, edit, and monitor short links with offer gates.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[color:var(--muted)] shadow-sm transition hover:text-[color:var(--accent-3)]"
          >
            {t(lang, "logout")}
          </button>
        </form>
      </div>

      {resolvedSearchParams?.error ? (
        <p className="mt-4 text-sm text-[color:var(--accent-3)]">
          {resolvedSearchParams.error}
        </p>
      ) : null}
      {resolvedSearchParams?.success ? (
        <p className="mt-4 text-sm text-[color:var(--accent-3)]">
          {resolvedSearchParams.success}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">{t(lang, "createLink")}</h2>
          <form action={createLinkAction} className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="code"
                placeholder="Short code (example: honeycake)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
                required
              />
              <input
                name="title"
                placeholder="Title"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
                required
              />
            </div>
            <input
              name="targetUrl"
              placeholder="Target URL (https://...)"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
              required
            />
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 bg-white/80 px-4 py-6 text-sm text-[color:var(--muted)] shadow-sm">
              <span className="font-semibold text-[color:var(--ink)]">
                Drag & drop an image here
              </span>
              <span className="text-xs">
                or click to upload (jpg/png/webp/gif)
              </span>
              <input
                type="file"
                name="imageFile"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs text-[color:var(--muted)] shadow-sm">
                <span className="font-semibold text-[color:var(--ink)]">
                  Crop ratio
                </span>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageAspect"
                    value="square"
                    defaultChecked
                  />
                  Square (1:1)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="imageAspect" value="landscape" />
                  Landscape (16:9)
                </label>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs text-[color:var(--muted)] shadow-sm">
                <span className="font-semibold text-[color:var(--ink)]">
                  Preview
                </span>
                <ImageUploadPreview />
              </div>
            </div>
            <input
              name="imageUrl"
              placeholder="Or paste an image URL (optional)"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
            />
            <input
              name="description"
              placeholder="Optional description"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="waitSeconds"
                type="number"
                min={0}
                max={3600}
                defaultValue={600}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
              />
              <input
                name="s1"
                placeholder="Sub ID s1 (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
              />
              <input
                name="s2"
                placeholder="Sub ID s2 (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
              <input
                type="checkbox"
                name="requireOfferWall"
                defaultChecked
              />
              Require offer wall before redirect
            </label>
            <FormSubmit label={t(lang, "createLink")} />
          </form>
        </div>

        <div className="space-y-4">
          <AdSlot label="Ad Slot - Admin" className="min-h-[200px]" />
          <div className="rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t(lang, "shortLinks")}</h2>
            <div className="mt-4 space-y-3 text-sm">
              {links.length === 0 ? (
                <p className="text-[color:var(--muted)]">
                  No links created yet.
                </p>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{link.title}</p>
                        <p className="text-xs text-[color:var(--muted)]">
                          /{link.code} • {link.click_count} clicks
                        </p>
                      </div>
                      <form action={deleteLinkAction}>
                        <input type="hidden" name="id" value={link.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-[color:var(--accent-3)]"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                    {link.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={link.image_url}
                        alt={link.title}
                        className="mt-3 h-28 w-full rounded-2xl object-cover"
                      />
                    ) : null}
                    <p className="mt-2 text-xs text-[color:var(--muted)]">
                      {link.target_url}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
