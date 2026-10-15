*> Shared account record layout (playground).
*> Change with care — every program that COPY ACCTREC depends on this.
01  ACCT-RECORD.
    05  ACCT-ID            PIC X(8).
    05  ACCT-NAME          PIC X(20).
    05  ACCT-BAL-TEXT      PIC X(10).
    05  ACCT-RATE-TEXT     PIC X(6).
