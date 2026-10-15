*> Night batch controller — CALL graph for estate ingest (not Runtime Kit main).
IDENTIFICATION DIVISION.
PROGRAM-ID. BATCHCTL.

DATA DIVISION.
WORKING-STORAGE SECTION.
01  WS-BAL                 PIC 9(7)V99 VALUE 1000.
01  WS-RATE                PIC 9(3)V99 VALUE 5.
01  WS-INT                 PIC 9(7)V99 VALUE 0.
01  WS-DYN-NAME            PIC X(8) VALUE "DYNUTIL".

PROCEDURE DIVISION.
MAIN.
    CALL "RATECALC" USING WS-BAL WS-RATE WS-INT
    *> Ghost load: OLDUTIL has no source in this estate
    CALL "OLDUTIL"
    *> Dynamic CALL — ingest marks dynamic-uncertain
    CALL WS-DYN-NAME
    STOP RUN.
