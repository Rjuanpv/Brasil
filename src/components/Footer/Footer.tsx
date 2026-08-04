import "./Footer.css";

/** O ano é lido na hora: um literal envelheceria em silêncio. */
const YEAR = new Date().getFullYear();

/**
 * Rodapé. O briefing pede o mínimo: nome do projeto, créditos, ano e links.
 *
 * Não tem animação de entrada, e é de propósito. A frase de encerramento é o
 * último gesto da narrativa; qualquer movimento depois dela competiria com o
 * fim em vez de fechá-lo.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <p className="footer__name display">Brasil em Movimento</p>
        <p className="footer__note">
          Projeto pessoal. Uma experiência de página única sobre um país que não cabe
          numa imagem parada.
        </p>
      </div>

      <nav className="footer__links label" aria-label="Links do projeto">
        <a href="#top" data-cursor="link">
          Início
        </a>
        <a href="#manifesto" data-cursor="link">
          Manifesto
        </a>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer noopener"
          data-cursor="link"
        >
          Código
        </a>
      </nav>

      <p className="footer__credits label">
        <span>Anton &amp; Inter — SIL Open Font License</span>
        <span>Imagens provisórias — Wikimedia Commons</span>
        <span>© {YEAR}</span>
      </p>
    </footer>
  );
}
