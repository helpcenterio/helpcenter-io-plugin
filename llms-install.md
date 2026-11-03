# Install HelpCenter.io MCP server

HelpCenter.io is a remote MCP server for writing, organizing and designing a HelpCenter.io
help center. Nothing to clone, build or run locally.

1. Server URL: `https://mcp.helpcenter.io`. Transport: streamable HTTP.
2. Add this entry to `cline_mcp_settings.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "helpcenter-io": {
      "type": "streamableHttp",
      "url": "https://mcp.helpcenter.io",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

3. Auth, pick one:
   - OAuth 2.1 (default): no headers. The server answers `401` with a `WWW-Authenticate`
     challenge, and the user signs in to HelpCenter.io in the browser and clicks Allow.
     In Cline CLI, run `cline mcp` and choose Authorize OAuth.
   - API key: ask the user for a key (created in Settings → API keys of their help center)
     and add `"headers": { "Authorization": "Bearer <API key>" }` to the entry.
     Never invent or guess a key.
4. Check it works: ask the assistant to list the help center's categories. The tools list
   should include `helpcenter_list_sites`.

Docs: https://developers.helpcenter.io/content/connect-an-ai-assistant-to-your-help-center
