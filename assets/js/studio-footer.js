window.renderStudioFooter = ({ home = "./" } = {}) => {
  const homeHref = String(home || "./").replace(/\/?$/, "/");
  const anchor = id => `${homeHref}#${id}`;

  return `
    <footer class="studio-footer" id="contacts">
      <div class="studio-footer__card">
        <span class="studio-footer__tape studio-footer__tape--left" aria-hidden="true"></span>
        <span class="studio-footer__tape studio-footer__tape--right" aria-hidden="true"></span>

        <div class="studio-footer__top">
          <div class="studio-footer__columns">
            <div class="studio-footer__column">
              <h3>Навигация</h3>
              <a href="${anchor("cases")}">Кейсы</a>
              <a href="${anchor("services")}">Услуги</a>
              <a href="${anchor("about")}">О нас</a>
              <a href="${anchor("faq")}">FAQ</a>
            </div>

            <div class="studio-footer__column">
              <h3>Контакты</h3>
              <a data-contact-link="email" href="mailto:sigidingo@gmail.com" data-contact-email>sigidingo@gmail.com</a>
              <a data-contact-link="phone" href="tel:+79619710515" data-contact-phone>+7 961 971-05-15</a>
              <a data-contact-link="telegram" href="https://t.me/sigidingo" target="_blank" rel="noreferrer">Telegram: <span data-contact-handle>@sigidingo</span></a>
            </div>
          </div>
        </div>

        <div class="studio-footer__signature">
          <div class="studio-footer__request">
            <div class="hero-request" data-hero-request>
              <button
                class="hero-request__open"
                type="button"
                data-hero-request-toggle
                aria-expanded="false"
                aria-controls="heroRequestForm"
              >
                <span class="hero-request__open-label">Оставить заявку</span>
                <span class="hero-request__open-chevron" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 5 12.5 10l-5 5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <form class="hero-request__form" id="heroRequestForm" autocomplete="on">
                <button
                  class="hero-request__collapse"
                  type="button"
                  data-hero-request-collapse
                  aria-label="Свернуть форму"
                >
                  <span class="hero-request__collapse-chevron" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M12.5 5 7.5 10l5 5"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <input type="text" name="name" placeholder="Имя" autocomplete="given-name" required />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Номер телефона"
                  autocomplete="tel"
                  inputmode="tel"
                />
                <input
                  type="text"
                  name="contact"
                  placeholder="WhatsApp, Telegram"
                  autocomplete="off"
                  required
                />
                <button class="hero-request__submit" type="submit">Отправить</button>
                <label class="form-consent hero-request__consent">
                  <input type="checkbox" name="privacy" value="1" required />
                  <span
                    >Соглашаюсь с
                    <a href="./privacy.html" target="_blank" rel="noopener">политикой конфиденциальности</a>
                    и обработкой персональных данных</span
                  >
                </label>
              </form>
            </div>
          </div>

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
