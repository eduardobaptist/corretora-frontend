import Image from "next/image";
import { House } from "@/components/icons";

// As fotos vêm como URLs absolutas da API (GET /uploads/**, público).
// `unoptimized`: o otimizador do Next bloqueia origens em IP local (localhost:8080);
// quando as fotos forem para um host/CDN público, dá para remover e configurar `images.remotePatterns`.

interface ImovelFotoProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ImovelFoto({ src, alt, sizes, priority, className }: ImovelFotoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className={`object-cover ${className ?? ""}`}
    />
  );
}

/** Placeholder quando o imóvel não tem fotos: gradiente do accent + casa. */
export function ImovelFotoPlaceholder({ iconClassName = "size-12" }: { iconClassName?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/25 via-accent/10 to-surface-secondary">
      <House className={`text-accent ${iconClassName}`} aria-hidden />
    </div>
  );
}
