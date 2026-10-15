# Micro Focus / Rocket Visual COBOL

Secondary enterprise target (after GnuCOBOL + IBM).

## Product lineage
Micro Focus COBOL tooling is now commonly documented under **Rocket Software Visual COBOL** (docs bundles). Treat “MF dialect” as a compatibility profile still spoken in banks/IT services.

## Dialects
Compiler directive `DIALECT` selects behavior bundles.

- Default often `DIALECT"MF"`  
- Other values include `ANS85`, `ISO2002`, `ENTCOBOL`, `OSVS`, `RM`, `ACU`, IBM-related profiles, etc.  

Docs:
- https://docs.rocketsoftware.com/bundle/visualcobolvs_ug_90/page/uhp1743704965047_5.html  
- Language Features – Dialect pages in the same bundle  

**Important:** dialect sets many other directives; order matters; may override prior settings.

## Managed vs native
Visual COBOL supports:
- Native COBOL  
- .NET COBOL / JVM COBOL (managed) in various editions  

Our Phase 1 does **not** target managed COBOL. Keep as future adapter note.

## Why IT services care
Many shops modernize off-mainframe onto MF/Rocket runtimes while keeping COBOL language. Pipeline templates should eventually support MF compile directives as a profile.

## Product implication
- Store `dialect = "mf"` (or specific) in project manifest.  
- Don’t assume GnuCOBOL `-std=mf` ≡ production MF without golden tests.  
- Phase 3: MF adapter after IBM path is credible.
