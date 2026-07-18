window.renderStudioFooter = ({ home = "./" } = {}) => {
  const homeHref = String(home || "./").replace(/\/?$/, "/");
  const anchor = id => `${homeHref}#${id}`;

  return `
    <footer class="studio-footer" id="contacts">
      <div class="studio-footer__card">
        <div class="studio-footer__top">
          <nav class="studio-footer__links" aria-label="Навигация и контакты">
            <a href="${anchor("cases")}">Кейсы</a>
            <a href="${anchor("services")}">Услуги</a>
            <a href="${anchor("about")}">О нас</a>
            <a href="${anchor("faq")}">FAQ</a>
            <a data-contact-link="email" href="mailto:sigidingo@gmail.com" data-contact-email>sigidingo@gmail.com</a>
            <a data-contact-link="phone" href="tel:+79619710515" data-contact-phone>+7 961 971-05-15</a>
            <a data-contact-link="telegram" href="https://t.me/sigidingo" target="_blank" rel="noopener noreferrer">Telegram: <span data-contact-handle>@sigidingo</span></a>
          </nav>
        </div>

        <div class="studio-footer__signature">
          <a class="studio-footer__wordmark" href="${homeHref}" aria-label="Согласовано">
            <img
              class="brand-wordmark brand-wordmark--footer-signature"
              src="./assets/images/brand/soglasovano-wordmark.svg"
              alt=""
              width="980"
              height="148"
              decoding="async"
            />
          </a>
        </div>
      </div>

      <div class="studio-footer__bottom">
        <div class="studio-footer__bottom-left">
          <span>© 2026 Согласовано. Все права защищены.</span>
          <a href="./privacy.html">Политика конфиденциальности</a>
          <a href="./terms.html">Условия использования</a>
        </div>
      </div>
    </footer>
  `;
};
