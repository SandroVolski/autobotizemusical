import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
    <Helmet>
      <title>Página não encontrada (404) — Autobotize</title>
      <meta
        name="description"
        content="A página que você procura não existe ou foi movida. Volte para a página inicial da Autobotize."
      />
      <meta name="robots" content="noindex, follow" />
      <meta property="og:title" content="Página não encontrada (404) — Autobotize" />
      <meta
        property="og:description"
        content="A página que você procura não existe ou foi movida. Volte para a página inicial da Autobotize."
      />
      <meta property="og:url" content="https://musica.autobotize.com/404" />
      <link rel="canonical" href="https://musica.autobotize.com/404" />
    </Helmet>
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ops! Página não encontrada</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Voltar para a página inicial
        </a>
      </div>
    </div>
    </>
  );
};

export default NotFound;
