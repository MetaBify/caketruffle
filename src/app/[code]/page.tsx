import { notFound, redirect } from "next/navigation";
import OfferWall from "@/components/OfferWall";
import { getShortLinkByCode, incrementClick } from "@/lib/shortlinks";
import { cookies } from "next/headers";
import { normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type LinkPageProps = {
  params: Promise<{ code: string }>;
};

export default async function LinkPage({ params }: LinkPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const link = await getShortLinkByCode(resolvedParams.code);
  if (!link) return notFound();

  if (!link.require_offer_wall) {
    await incrementClick(link.code);
    redirect(link.target_url);
  }

  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);

  return (
    <OfferWall
      lang={lang}
      code={link.code}
      title={link.title}
      imageUrl={link.image_url}
      waitSeconds={link.wait_seconds}
      s1={link.s1}
      s2={link.s2}
    />
  );
}
