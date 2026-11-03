// Which server in .mcp.json a skill's tools come from. A skill not listed here uses
// `helpcenter`, the account connector at https://mcp.helpcenter.io, the one server the
// ChatGPT package (openai/mcp.json) names.
//
// `helpcenter-agent` is the connector's no-account endpoint, https://mcp.helpcenter.io/agent.
// Its tools share their names with the account tools and take an `agent_key` argument.
export const skillServers = {
  "helpcenter-create-help-center": "helpcenter-agent",
};

export function serverOf(skill) {
  return skillServers[skill] ?? "helpcenter";
}
