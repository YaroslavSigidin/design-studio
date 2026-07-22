/**
 * WebMCP tools for in-browser agents (navigator.modelContext.registerTool).
 * Registers as early as possible so scanners can observe tools on page load.
 */
(() => {
  const registerAll = () => {
    const modelContext = navigator.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      return false;
    }

    if (window.__studioWebMcpBound) return true;
    window.__studioWebMcpBound = true;

    const cfg = () => window.STUDIO_CONFIG || {};

    const safeRegister = tool => {
      try {
        modelContext.registerTool(tool);
      } catch (error) {
        console.warn("[webmcp]", tool.name, error);
      }
    };

    safeRegister({
      name: "submit_lead",
      description:
        "Submit a project brief to Согласовано via the public lead API. Requires name and phone or contact.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          contact: { type: "string" },
          service: { type: "string" },
          budget: { type: "string" },
          deadline: { type: "string" },
          comment: { type: "string" },
          source: { type: "string" }
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
        if (!payload.name) return { ok: false, error: "name is required" };
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

    safeRegister({
      name: "list_cases",
      description: "List portfolio cases from the public cases manifest.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 50 }
        }
      },
      async execute(input = {}) {
        const limit = Math.max(1, Math.min(50, Number(input.limit) || 12));
        const manifestUrl = cfg().manifest || "./data/cases.manifest.json";
        const response = await fetch(manifestUrl, { credentials: "same-origin" });
        if (!response.ok) return { ok: false, error: `manifest ${response.status}` };
        const data = await response.json();
        const projects = Array.isArray(data?.projects)
          ? data.projects
          : Array.isArray(data?.items)
            ? data.items
            : [];
        const cases = projects.slice(0, limit).map(project => ({
          id: project.id || project.caseKey || "",
          title: project.title || project.name || "",
          summary: project.summary || project.description || "",
          url: project.id
            ? `${cfg().casePageBase || "./case.html"}?slug=${encodeURIComponent(project.id)}`
            : "./#cases"
        }));
        return { ok: true, count: cases.length, cases };
      }
    });

    safeRegister({
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

    safeRegister({
      name: "open_site_section",
      description: "Navigate to a main site section.",
      inputSchema: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["cases", "services", "about", "contacts", "home"]
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

    return true;
  };

  // Try immediately (scanner polyfills may already exist), then retry.
  if (!registerAll()) {
    document.addEventListener("DOMContentLoaded", registerAll);
    window.setTimeout(registerAll, 0);
    window.setTimeout(registerAll, 250);
    window.setTimeout(registerAll, 1000);
  }
})();
