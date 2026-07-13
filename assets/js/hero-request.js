const formatRuPhone = input => {
  let digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "8") digits = `7${digits.slice(1)}`;
  if (digits[0] === "9") digits = `7${digits}`;
  if (digits[0] !== "7") digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const code = digits.slice(1, 4);
  const part1 = digits.slice(4, 7);
  const part2 = digits.slice(7, 9);
  const part3 = digits.slice(9, 11);

  let formatted = "+7";
  if (code) formatted += ` (${code}`;
  if (code.length === 3) formatted += ")";
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;
  return formatted;
};

const getPhoneDigits = value => String(value || "").replace(/\D/g, "");

const initHeroRequest = () => {
  const root = document.querySelector("[data-hero-request]");
  const toggle = root?.querySelector("[data-hero-request-toggle]");
  const form = root?.querySelector(".hero-request__form");
  const phoneInput = form?.querySelector('input[name="phone"]');
  if (!root || !toggle || !form) return;

const OPEN_ANIMATION_MS = 640;

  const open = () => {
    if (root.classList.contains("is-open")) return;
    root.classList.add("is-opening", "is-open");
    toggle.setAttribute("aria-expanded", "true");
    window.setTimeout(() => {
      root.classList.remove("is-opening");
      form.querySelector('input[name="name"]')?.focus();
    }, OPEN_ANIMATION_MS);
  };

  const close = () => {
    if (!root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };

  toggle.addEventListener("click", open);

  if (phoneInput) {
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value.trim()) phoneInput.value = "+7 ";
    });
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatRuPhone(phoneInput.value);
    });
    phoneInput.addEventListener("blur", () => {
      if (getPhoneDigits(phoneInput.value).length <= 1) phoneInput.value = "";
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !root.classList.contains("is-open")) return;
    close();
  });

  document.addEventListener(
    "click",
    event => {
      if (!root.classList.contains("is-open")) return;
      if (root.contains(event.target)) return;
      close();
    },
    true
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroRequest);
} else {
  initHeroRequest();
}
