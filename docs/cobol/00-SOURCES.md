# Official sources catalog

Trust order for this repo: **vendor/standard docs first**, tutorials second, tribal knowledge last.

## Language standards
| Source | URL / note |
|--------|------------|
| ISO/IEC 1989:2023 (current COBOL) | https://www.iso.org/standard/74527.html |
| ISO/IEC 1989:2014 (withdrawn, still widely referenced) | https://www.iso.org/standard/51416.html |
| Historical overview | https://en.wikipedia.org/wiki/COBOL |

Paid ISO text is not redistributed here.

## GnuCOBOL (Phase 1 target)
| Doc | URL |
|-----|-----|
| Guides hub | https://gnucobol.sourceforge.io/guides.html |
| Programmer’s Guide | https://gnucobol.sourceforge.io/HTML/gnucobpg.html |
| cobc manual | https://gnucobol.sourceforge.io/doc/gnucobol.html |
| FAQ / How-To | https://gnucobol.sourceforge.io/faq/gcfaq.html |

## IBM Enterprise COBOL for z/OS
| Doc | URL |
|-----|-----|
| Documentation library (6.5 PDFs) | https://www.ibm.com/support/pages/enterprise-cobol-zos-documentation-library |
| Language Reference | IBM Docs / PDF via library (SC27-8713) |
| Programming Guide | IBM Docs / PDF via library (SC27-8714) |
| Migration / Messages / Performance | Same library |
| Compile JCL topic | https://www.ibm.com/docs/en/cobol-zos/6.4.0?topic=jcl-writing-compile-programs |
| File organization | https://www.ibm.com/docs/en/cobol-zos/6.5.0?topic=files-file-organization-input-output-devices |
| COPY statement | https://www.ibm.com/docs/en/cobol-zos/6.3.0?topic=statements-copy-statement |
| CICS coding for COBOL | https://www.ibm.com/docs/en/cobol-zos/6.3?topic=cics-coding-cobol-programs-run-under |

## JCL / z/OS basics
| Doc | URL |
|-----|-----|
| What is JCL | https://www.ibm.com/docs/en/zos-basic-skills?topic=sdsf-what-is-jcl |
| Reusable JCL collection | IBM z/OS Basic Skills JCL book |
| Compile-link-go procedure | https://www.ibm.com/docs/en/zos-basic-skills?topic=procedures-cobol-compile-link-go-procedure |

## CICS
| Doc | URL |
|-----|-----|
| EXEC CICS format | https://www.ibm.com/docs/en/cics-ts/6.x?topic=reference-exec-cics-command-format-programming-considerations |
| COBOL restrictions | https://www.ibm.com/docs/en/cics-ts/6.x?topic=applications-cobol-programming-restrictions-requirements |
| API Reference PDF | IBM CICS TS 6.x API Reference |

## Db2
| Doc | URL |
|-----|-----|
| Host variables in COBOL | https://www.ibm.com/docs/en/db2-for-zos/13.0.0?topic=statements-declaring-host-variables-indicator-variables-in-cobol |
| Embedded SQL development (LUW PDF example) | IBM Db2 embedded SQL guides |

## Micro Focus / Rocket Visual COBOL
| Doc | URL |
|-----|-----|
| Dialect / DIALECT directive | https://docs.rocketsoftware.com/bundle/visualcobolvs_ug_90/page/uhp1743704965047_5.html |
| Language features – Dialect | https://docs.rocketsoftware.com/bundle/visualcobolvs_ug_90/page/fsy1743705978028.html |

## How we use sources in this repo
1. Summarize facts needed for Studio / Runtime / Sense.  
2. Link the authoritative page.  
3. Mark vendor-specific behavior clearly (`IBM`, `GnuCOBOL`, `MF`).  
4. Never commit copyrighted manuals as whole files.
