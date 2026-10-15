# IBM Enterprise COBOL for z/OS

Primary **bank money** compiler target (after GnuCOBOL for local).

## Official library
https://www.ibm.com/support/pages/enterprise-cobol-zos-documentation-library

Core books (names; get current PDFs from library):
- **Language Reference** — syntax & IBM extensions  
- **Programming Guide** — compile, debug, optimize, OS interaction  
- **Migration Guide** — version-to-version  
- **Messages and Codes** — compiler/runtime messages  
- **Performance Tuning Guide**  

Version note: docs update under continuous delivery; pin version in customer connectors (e.g. 6.4 / 6.5).

## Runtime: Language Environment (LE)
Enterprise COBOL programs run with **z/OS Language Environment**. Link/run details live in LE guides as well as the COBOL Programming Guide.

## Compile on z/OS (conceptual)
1. Compiler program `IGYCRCTL`  
2. Object → binder/link-edit (`IEWL` / `HEWL`)  
3. Go / execute load module  
Cataloged procs like `IGYWCLG` (compile-link-go) wrap this.  
See: IBM “Writing JCL to compile programs” and compile-link-go procedure docs.

## Source & listings
IBM compiler options control listings, maps, XREF, truncation rules (`TRUNC`), number handling (`NUMPROC`), etc. Incorrect options = subtle numeric bugs — Sense/Pipeline should record option sets used in builds.

## Extensions banks rely on
Examples (verify in Language Reference for version):
- JSON PARSE / GENERATE  
- XML support  
- Java interoperability features  
- Db2 / CICS integrated translators  
- Pointer / UTF-8 / national enhancements over releases  

## EBCDIC & encodings
Mainframe data is often EBCDIC. Local GnuCOBOL ASCII tests can pass while mainframe fails on character data — Control Plane adapters must track encoding.

## Product connector (Phase 3)
```
Studio change → prove on GnuCOBOL → package → submit to IBM compile service / pipeline → staging → approval → prod
```
Never auto-prod without Control Plane gates ([SAFETY](../SAFETY.md)).
