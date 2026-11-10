"use client";

import { Button, Chip } from "@heroui/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { ImovelFoto, ImovelFotoPlaceholder } from "./imovel-midia";

/** Foto principal com setas + miniaturas. Sem fotos: placeholder do tema. */
export function ImovelGaleria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  const total = fotos.length;
  const ir = (i: number) => setAtual((i + total) % total);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="galeria"
        aria-label={`Fotos de ${titulo}`}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-secondary sm:aspect-[16/10]"
        onKeyDown={(e) => {
          if (total < 2) return;
          if (e.key === "ArrowLeft") ir(atual - 1);
          if (e.key === "ArrowRight") ir(atual + 1);
        }}
      >
        {total > 0 ? (
          <ImovelFoto
            key={fotos[atual]}
            src={fotos[atual]}
            alt={`${titulo}: foto ${atual + 1} de ${total}`}
            sizes="(min-width: 1280px) 60vw, 100vw"
            priority={atual === 0}
          />
        ) : (
          <ImovelFotoPlaceholder iconClassName="size-16" />
        )}

        {total > 1 && (
          <>
            <Button
              isIconOnly
              variant="secondary"
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-sm"
              onPress={() => ir(atual - 1)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </Button>
            <Button
              isIconOnly
              variant="secondary"
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-sm"
              onPress={() => ir(atual + 1)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </Button>
            <Chip size="sm" variant="secondary" className="absolute bottom-3 right-3" aria-live="polite">
              {atual + 1} / {total}
            </Chip>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {fotos.map((foto, i) => (
            <li key={foto} className="shrink-0">
              <button
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual}
                onClick={() => setAtual(i)}
                className={`relative block h-14 w-20 overflow-hidden sm:h-16 sm:w-24 rounded-lg outline-none ring-offset-2 ring-offset-background transition focus-visible:ring-2 focus-visible:ring-focus ${
                  i === atual ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"
                }`}
              >
                <ImovelFoto src={foto} alt="" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
