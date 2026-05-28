import type { ReactNode } from 'react';

interface Props {
  sidebar: ReactNode;
  title: string;
  description?: string;
}

export default function ComingSoonInternalPage({ sidebar, title, description }: Props) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="ml-64 flex-1 flex items-center justify-center bg-gray-100">
        <div className="flex max-w-md flex-col items-center gap-4 text-center px-8">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-primario">
            Próximamente
          </span>
          <h1 className="text-[28px] font-bold text-gray-900">{title}</h1>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            {description ?? 'Estamos construyendo esta sección. Muy pronto estará disponible.'}
          </p>
        </div>
      </main>
    </div>
  );
}
