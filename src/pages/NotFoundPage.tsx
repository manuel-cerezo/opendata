import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NotFoundPage() {
  return (
    <div>
      <PageHeader
        title="Página no encontrada"
        description="La página que buscas no existe o se ha movido."
      >
        <Link to="/" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-light transition-opacity hover:opacity-90 dark:text-dark">
          Volver al inicio
        </Link>
      </PageHeader>
    </div>
  );
}
