import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl text-fg md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
