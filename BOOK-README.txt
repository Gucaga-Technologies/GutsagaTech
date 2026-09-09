THE RUSSIAN WEB BOOK — /ru/kniga/
==================================

WHAT IT IS
The full Russian web edition of "Эволюция фармацевтического рынка", built from
the owner's RC3 handoff package. 44 pages: cover, contents, 20+ chapters,
practicum, search, about the author, plus PDF and EPUB downloads.

IT NOW WORKS BOTH WAYS (CHANGED IN v37)
Up to v36 the book only worked on a server. It was built for the absolute path
/ru/kniga/, so every internal link looked like /ru/kniga/read/chapter-01/.
Opened straight from a folder on Windows the browser read that as
C:\ru\kniga\read\chapter-01 — which does not exist. That is why the book showed
up as raw unstyled text and every chapter link gave ERR_FILE_NOT_FOUND.

In v37 the book's internal links, stylesheets, scripts and images were converted
from absolute (/ru/kniga/...) to relative (../assets/app.css,
read/chapter-01/index.html, and so on): 4,221 references in 44 files.

Relative links are correct in BOTH places:
  - double-click ru/kniga/index.html in the folder   -> works
  - https://gutsaga.tech/ru/kniga/                   -> works, unchanged

Nothing else about the book changed: same text, same pages, same design, same
downloads. Only the shape of the links.

You can still preview the whole site with a server if you prefer — from the
site root (the folder holding index.html):

    python -m http.server 8080
    then open  http://localhost:8080/ru/kniga/

WHAT ELSE WAS ADJUSTED FOR LOCAL USE
  - assets/search.js now finds its data next to itself instead of at a fixed
    site path, and loads it as assets/search-index.js (a plain script) rather
    than by fetch(), because browsers block fetch() of a local file. Search
    therefore works from the folder as well as from the server.
    search-index.json is still present and is still what the server build uses.
  - assets/app.js stores the "continue reading" position as a path relative to
    the book root, so the Продолжить чтение button lands on the right chapter
    in both cases.
These two files are the book's own scripts. The chapter text was not touched.

WHERE IT WAS BUILT FROM
  Source: PharmaBook_RUS_WEB_EDITION_PHASE1_RC3.zip
  SHA-256 verified: ea3762dc899d47ce7d08a512de6aae170181e15780648e1b111144632da6e558
  Built with: TOOLS/build_for_target.py
      --origin https://gutsaga.tech --base-path /ru/kniga/
  The package's own production QA gate ran on that build and returned PASS,
  0 blockers, 0 majors. Analytics stayed off, as the handoff requires.
  The RC3 source ZIP itself was not altered.

IF YOU EVER WANT THE ORIGINAL SERVER-ONLY BUILD BACK
Re-run the helper from the untouched RC3 package:

    python3 TOOLS/build_for_target.py --origin https://gutsaga.tech \
        --base-path /ru/kniga/

and replace the ru/kniga/ folder with its output. You then lose the ability to
open the book by double-clicking; on the live server both builds behave
identically.

WHY /ru/kniga/ AND NOT /ru/evolution/
The handoff is explicit: /ru/evolution/ is the CONTINUATION destination from the
end of the book, not the book itself, and the build tool refuses to use it as
the book root. So the book lives at /ru/kniga/ and /ru/evolution/ stays what it
already was — the page a reader reaches after finishing, with the self-check.

HOW A READER GETS THERE
  English site  ->  /book/            English page, English cover
                ->  "Читать по-русски"    -> /ru/evolution/
                ->  "Читать книгу онлайн" -> /ru/kniga/
The printed QR codes point at /ru/evolution/, which is unaffected by where the
book itself lives.
