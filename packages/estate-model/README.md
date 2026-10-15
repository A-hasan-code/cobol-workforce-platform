# Estate data model

Bank-scale concepts used by Studio and `@cobol/estate-ingest`.  
Fixture `fixtures/bank-playground.estate.json` is **regenerated** by:

```bash
npm run estate:ingest
```

## Entities

| Entity | Purpose |
|--------|---------|
| `Program` | COBOL source / load identity |
| `Copybook` | Shared COPY member + fields |
| `Dependency` | COPY / CALL / EXEC / DD edge |
| `Job` | JCL job / step (stub) |
| `DatasetRef` | Logical file / DD → dataset |
| `GhostFlag` | orphan / undocumented status |
| `Environment` | local \| ci \| staging \| prod |
| `IngestRun` | connector audit record (Phase 2) |

JSON Schema: `schema/estate.schema.json`  
Sample fixture: `fixtures/bank-playground.estate.json`
