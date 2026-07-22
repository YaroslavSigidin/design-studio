/**
 * WebMCP tools for in-browser agents (Chrome modelContext API).
 * No visual UI changes — registers tools when the API exists.
 */
const initWebMcp = () => {
  const modelContext = navigator.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== "function") {
    return;
  }

  const cfg = () => window.STUDIO_CONFIG || {};

  const register = (tool) => {
    try {
      modelContext.registerTool(tool);
    } catch (error) {
      console.warn("[webmcp] registerTool failed", tool?.name, error);
    }
  };

  register({
    name: "submit_lead",
    description:
      "Submit a project brief to Согласовано via the public lead API. Requires name, privacy acceptance, and phone or contact.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Client name" },
        phone: { type: "string", description: "Phone number" },
        contact: { type: "string", description: "Telegram / email / messenger" },
        service: { type: "string", description: "Requested service" },
        budget: { type: "string" },
        deadline: { type: "string" },
        comment: { type: "string", description: "Project brief text" },
        source: { type: "string", description: "Lead source label", default: "WebMCP" }
      },
      required: ["name"]
    },
    async execute(input = {}) {
      const payload = {
        source: String(input.source || "WebMCP"),
        name: String(input.name || "").trim(),
        phone: String(input.phone || "").trim(),
        contact: String(input.contact || "").trim(),
        service: String(input.service || "").trim(),
        budget: String(input.budget || "").trim(),
        deadline: String(input.deadline || "").trim(),
        comment: String(input.comment || "").trim()
      };

      if (!payload.name) {
        return { ok: false, error: "name is required" };
      }
      if (!payload.phone && !payload.contact) {
        return { ok: false, error: "phone or contact is required" };
      }
      if (!window.STUDIO_CONTACT?.submitLead) {
        return { ok: false, error: "Lead client is not ready" };
      }

      const result = await window.STUDIO_CONTACT.submitLead(payload);
      return {
        ok: Boolean(result?.ok && result?.confirmed),
        confirmed: Boolean(result?.confirmed),
        mode: result?.mode || "",
        requestId: result?.requestId || "",
        error: result?.error || ""
      };
    }
  });

  register({
    name: "list_cases",
    description: "List portfolio cases from the public cases manifest (id, title, summary).",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 50, default: 12 }
      }
    },
    async execute(input = {}) {
      const limit = Math.max(1, Math.min(50, Number(input.limit) || 12));
      const manifestUrl = cfg().manifest || "./data/cases.manifest.json";
      const response = await fetch(manifestUrl, { credentials: "same-origin" });
      if (!response.ok) {
        return { ok: false, error: `Failed to load manifest (${response.status})` };
      }
      const data = await response.json();
      const projects = Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data?.items)
          ? data.items
          : [];
      const cases = projects.slice(0, limit).map(project => ({
        id: project.id || project.caseKey || "",
        title: project.title || project.name || "",
        summary: project.summary || project.description || project.excerpt || "",
        url: project.id
          ? `${cfg().casePageBase || "./case.html"}?slug=${encodeURIComponent(project.id)}`
          : cfg().studioCases || "./#cases"
      }));
      return { ok: true, count: cases.length, cases };
    }
  });

  register({
    name: "get_contact_info",
    description: "Return public contact channels for Согласовано.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const contacts = cfg().contacts || {};
      return {
        ok: true,
        name: contacts.name || "",
        telegram: contacts.telegramUrl || "",
        phone: contacts.phoneDisplay || "",
        email: contacts.email || "",
        site: cfg().siteUrl || window.location.origin
      };
    }
  });

  register({
    name: "open_site_section",
    description: "Navigate the current tab to a main site section hash.",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["cases", "services", "about", "contacts", "home"],
          description: "Section to open"
        }
      },
      required: ["section"]
    },
    async execute(input = {}) {
      const section = String(input.section || "home");
      const href = section === "home" ? "./" : `./#${section}`;
      window.location.href = href;
      return { ok: true, href };
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWebMcp);
} else {
  initWebMcp();
}
