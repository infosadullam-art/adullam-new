// Chargeur d'images commun a tout le site : les images Alibaba sont servies en version reduite
// (s.alicdn.com/@sc04/kf/..._NxNq80.jpg), bien plus legere, au lieu des originaux de sc04.alicdn.com
// qui renvoient parfois une page HTML au premier acces.
const ALI_SIZES = [220, 350, 960]

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const needed = Math.round(width * 0.9)
  const size = ALI_SIZES.find((s) => s >= needed) ?? 960
  const m = /^(?:https?:)?\/\/sc04\.alicdn\.com\/kf\/([^?#]+)$/i.exec(src)
  if (m) return `https://s.alicdn.com/@sc04/kf/${m[1]}_${size}x${size}q80.jpg`
  if (/^(?:https?:)?\/\/s\.alicdn\.com\/@sc04\/kf\//i.test(src)) {
    const base = src.replace(/(\.(?:jpe?g|png|webp|gif))_\d+x\d+(?:q\d+)?\.(?:jpe?g|png|webp|avif)$/i, "$1")
    if (!/[?#]/.test(base)) return `${base.startsWith("//") ? "https:" + base : base}_${size}x${size}q80.jpg`
  }
  if (src.startsWith("/")) return `${src}${src.includes("?") ? "&" : "?"}w=${width}`
  return src
}
