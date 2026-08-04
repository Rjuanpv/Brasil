import "./Navigation.css";

interface NavigationProps {
  /** Rótulo da seção atual, à direita da marca. */
  section: string;
  /** Entra como passo 5 da abertura, depois do título da Hero. */
  visible: boolean;
}

/**
 * Navegação minimalista e fixa: marca, indicador de seção, botão MENU.
 * O doc é explícito em não criar uma barra grande.
 *
 * Enquanto a abertura roda, a navegação fica fora da ordem de tabulação e do
 * leitor de tela — visualmente ausente e ausente de fato.
 *
 * O painel de menu em tela cheia entra junto com as seções restantes; por ora o
 * botão existe, é focável e anuncia seu estado.
 */
export function Navigation({ section, visible }: NavigationProps) {
  const focusable = visible ? 0 : -1;

  return (
    <header className="nav" data-visible={visible} aria-hidden={!visible || undefined}>
      <a className="nav__brand display" href="#top" data-cursor="link" tabIndex={focusable}>
        Brasil
      </a>

      <span className="nav__section label" aria-live="polite">
        {section}
      </span>

      <button
        type="button"
        className="nav__menu label"
        data-cursor="link"
        aria-expanded={false}
        tabIndex={focusable}
      >
        Menu
      </button>
    </header>
  );
}
