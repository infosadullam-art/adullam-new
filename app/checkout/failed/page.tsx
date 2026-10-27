'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { XCircle, AlertCircle, ArrowLeft, RefreshCw, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const brandColor = "#2B4F3C";
const softBg = "#F8FAF9";

function PaymentFailedContent() {
  const t = useTranslations("checkoutResult");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reference, setReference] = useState("");

  useEffect(() => {
    // Le message affiché est toujours le nôtre (jamais un texte venu de l'adresse).
    // La référence n'est affichée que si elle a une forme sûre.
    const refParam = searchParams.get("reference") || "";
    if (/^[A-Za-z0-9_-]{1,64}$/.test(refParam)) setReference(refParam);
  }, [searchParams]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: softBg }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-6 lg:py-10">
        <div className="max-w-md mx-auto px-4">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("back")}
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t("failedTitle")}</h1>
            <p className="text-gray-500 mb-6">{t("failedText")}</p>

            {reference && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{t("reference")}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{reference}</p>
              </div>
            )}

            <div className="text-start mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-medium text-amber-800 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                {t("causesTitle")}
              </p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>{t("cause1")}</li>
                <li>{t("cause2")}</li>
                <li>{t("cause3")}</li>
                <li>{t("cause4")}</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/checkout")}
                className="flex-1 h-12 text-white font-medium"
                style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}
              >
                <RefreshCw className="w-4 h-4 me-2" />
                {t("retry")}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                  <Home className="w-4 h-4 me-2" />
                  {t("home")}
                </Button>
              </Link>
              <Link href="/cart" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                  <ShoppingBag className="w-4 h-4 me-2" />
                  {t("viewCart")}
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {t("support")}
                <a href="mailto:infos.adullam@gmail.com" className="text-[#2B4F3C] hover:underline ms-1">
                  infos.adullam@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}

function FailedFallback() {
  const t = useTranslations("checkoutResult");
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: brandColor }} />
        <p className="text-sm text-gray-500 mt-3">{t("loading")}</p>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<FailedFallback />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
