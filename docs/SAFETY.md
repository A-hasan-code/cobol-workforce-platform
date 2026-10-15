# Safety rules (human + Cursor)

Encoded for the agent in `.cursor/rules/git-deploy-safety.mdc`. This file is the human-readable copy.

## Deploy
Before any deploy, publish, release, hosting, cloud provision, or production-like runtime push:

1. Stop  
2. Ask the owner what / where / risk  
3. Proceed only after a clear yes in the conversation  

## Git push
- Never push or publish a remote without explicit owner approval  
- Create commits only when the owner asks  
- Never change git config (`user.name`, `user.email`, remotes) unless asked  

## Git identity
Expected human identity when configured:

- **name:** `A-hasan-code`  
- **email:** `alihasan12soft786@gmail.com`  

Never allow Cursor, Copilot, or any AI/tool name as author or committer.  
If identity is missing or wrong: stop and ask the owner to fix it locally.

## Secrets
- Never commit `.env`, tokens, PATs, or credentials  
- Never paste passwords into chat; use `gh auth login` / device flow / local PAT  
