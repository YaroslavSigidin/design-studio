# DNS-AID setup (Timeweb panel)

Publish these DNS records for AI discovery (draft DNS-AID / RFC 9460).  
Do this in the Timeweb DNS UI for `soglasovano.online` — not via git.

## Recommended

1. Enable DNSSEC for the zone if Timeweb offers it.
2. Add an HTTPS/SVCB-style record (or TXT fallback if the panel lacks SVCB):

### Preferred (when panel supports HTTPS/SVCB)
- Name: `_index._agents`
- Type: `HTTPS` (or `SVCB`)
- Value idea: point `alpn` + endpoint toward the site agent catalog, e.g. path `/.well-known/api-catalog`

### Practical fallback (always available)
- Name: `_agents`
- Type: `TXT`
- Value: `catalog=https://soglasovano.online/.well-known/api-catalog`

After DNS propagates, re-scan https://isitagentready.com/soglasovano.online
