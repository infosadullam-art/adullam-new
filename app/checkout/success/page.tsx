'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { CheckCircle2, Package, MapPin, Calendar, Truck, Clock, Loader2, ArrowLeft, Home, ShoppingBag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useLocale } from "@/context/LocaleProvider";
import { ordersApi } from "@/lib/admin/api-client";
import { apiFetch } from "@/lib/api";

const brandColor = "#2B4F3C";
const softBg = "#F8FAF9";

// Le webhook GeniusPay peut arriver quelques secondes après le retour du client :
// on interroge la commande toutes les 3 s pendant 30 s au maximum.
const MAX_TRIES = 10;
const DELAY_MS = 3000;
const KNOWN_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"];

type Etat = "loading" | "paid" | "pending" | "error";

function CheckoutSuccessContent() {
  const t = useTranslations("checkoutResult");
  const tTrack = useTranslations("orderTracking");
  const { language } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrencyFormatter();

  const [order, setOrder] = useState<any>(null);
  const [etat, setEtat] = useState<Etat>("loading");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.push("/account/orders");
      return;
    }

    let annule = false;
    const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      let verifie = false;
      for (let i = 0; i < MAX_TRIES; i++) {
        if (annule) return;
        try {
          const res: any = await ordersApi.get(orderId);
          const o = res?.data;
          if (!res?.success || !o) {
            if (!annule) setEtat("error");
            return;
          }
          if (annule) return;
          if (o.paymentStatus === "PAID") {
            setOrder(o);
            setEtat("paid");
            return;
          }
          // Webhook en retard : on demande la confirmation directement (idempotent côté serveur)
          const ref = o.metadata?.paymentReference;
          if (ref && !verifie && i >= 1) {
            verifie = true;
            try {
              await apiFetch(`/api/payment/verify?reference=${encodeURIComponent(String(ref))}&method=geniuspay`);
            } catch {
              /* on continue d'interroger la commande */
            }
            continue;
          }
          setOrder(o);
        } catch {
          if (!annule) setEtat("error");
          return;
        }
        await attendre(DELAY_MS);
      }
      if (!annule) setEtat("pending");
    })();

    return () => {
      annule = true;
    };
  }, [orderId, router]);

  if (etat === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: brandColor }} />
          <p className="text-sm text-gray-500">{t("verifying")}</p>
        </div>
      </div>
    );
  }

  if (etat === "pending" || etat === "error") {
    const enAttente = etat === "pending";
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${enAttente ? "bg-amber-100" : "bg-red-100"}`}>
            {enAttente ? <Clock className="w-8 h-8 text-amber-600" /> : <XCircle className="w-8 h-8 text-red-500" />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{enAttente ? t("pendingTitle") : t("notFoundTitle")}</h2>
          <p className="text-gray-600 mb-6">{enAttente ? t("pendingText") : t("errorText")}</p>
          <Link href="/account/orders">
            <Button className="w-full" style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}>
              {t("myOrders")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + 15);
  const estimatedDelivery = estimatedDate.toLocaleDateString(language, { day: "2-digit", month: "2-digit", year: "numeric" });
  const orderDate = new Date(order.createdAt).toLocaleDateString(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shippingInfo = order.shippingInfo || {};
  const address = `${shippingInfo.address || ""}${shippingInfo.quartier ? `, ${shippingInfo.quartier}` : ""}, ${shippingInfo.city || ""}`;
  const itemCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
  const statusText = KNOWN_STATUSES.includes(order.status) ? tTrack(`status.${order.status}`) : order.status;
  const email = order.user?.email || shippingInfo.email;

  return (
    <div className="min-h-screen" style={{ backgroundColor: softBg }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-6 lg:py-10">
        <div className="max-w-2xl mx-auto px-4">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("back")}
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${brandColor}10` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: brandColor }} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t("confirmedTitle")}</h1>
            <p className="text-gray-500 mb-6">{t("confirmedText")}</p>
            <div className="inline-flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wide">{t("orderNumber")}</span>
              <span className="text-lg lg:text-xl font-bold mt-1" style={{ color: brandColor }}>{order.orderNumber || order.id}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Package className="w-5 h-5" style={{ color: brandColor }} />
              {t("detailsTitle")}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Clock className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t("status")}</p>
                  <p className="text-sm text-gray-500">{statusText}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Calendar className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t("orderDate")}</p>
                  <p className="text-sm text-gray-500">{orderDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Truck className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t("estimatedDelivery")}</p>
                  <p className="text-sm text-gray-500">{estimatedDelivery}</p>
                </div>
              </div>

              {shippingInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                    <MapPin className="w-4 h-4" style={{ color: brandColor }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t("address")}</p>
                    <p className="text-sm text-gray-500">{address}</p>
                    {shippingInfo.country && <p className="text-sm text-gray-500">{shippingInfo.country}</p>}
                    {shippingInfo.phone && <p className="text-sm text-gray-500 mt-1">📞 {shippingInfo.phone}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: brandColor }} />
              {t("recap")}
            </h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                    {item.variantSummary && <p className="text-xs text-gray-400">{item.variantSummary}</p>}
                    <p className="text-xs text-gray-400 mt-1">{t("quantity", { count: item.quantity })}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("subtotal", { count: itemCount })}</span>
                <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("shipping")}</span>
                <span className="text-gray-700">{formatPrice(order.shippingCost)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">🎫 {t("discount", { code: order.couponCode || "" })}</span>
                  <span className="text-green-600">- {formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-900">{t("total")}</span>
                <span className="font-bold text-xl" style={{ color: brandColor }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                <Home className="w-4 h-4 me-2" />
                {t("home")}
              </Button>
            </Link>
            <Link href="/account/orders" className="flex-1">
              <Button className="w-full h-12 text-white font-medium" style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}>
                <Package className="w-4 h-4 me-2" />
                {t("myOrders")}
              </Button>
            </Link>
          </div>

          {email && <p className="text-center text-xs text-gray-400 mt-6">{t("emailSent", { email })}</p>}
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}

function SuccessFallback() {
  const t = useTranslations("checkoutResult");
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: brandColor }} />
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
