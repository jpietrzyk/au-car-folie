# SEO Sitemap Submission Checklist

Praktyczna checklista do zgłoszenia sitemapy w Google Search Console i Bing Webmaster Tools.

## Prerequisites

- Strona działa produkcyjnie pod domeną `https://car-folie.pl`
- Sitemap jest publicznie dostępna: `https://car-folie.pl/sitemap.xml`
- Robots jest publicznie dostępny: `https://car-folie.pl/robots.txt`
- Masz uprawnienia właściciela do domeny w GSC i BWT

## 1) Google Search Console

1. Wejdź do: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Dodaj właściwość domenową (`car-folie.pl`) jeśli jeszcze jej nie ma.
3. Zweryfikuj własność domeny (najlepiej rekord DNS TXT).
4. W menu po lewej wybierz **Sitemaps**.
5. W polu "Add a new sitemap" wpisz: `sitemap.xml`.
6. Kliknij **Submit**.
7. Sprawdź status: powinien przejść na **Success**.

## 2) Bing Webmaster Tools

1. Wejdź do: [https://www.bing.com/webmasters](https://www.bing.com/webmasters)
2. Dodaj witrynę `https://car-folie.pl`.
3. Zweryfikuj własność domeny (DNS / meta tag / plik XML).
4. Przejdź do **Sitemaps**.
5. Dodaj URL: `https://car-folie.pl/sitemap.xml`.
6. Zatwierdź i sprawdź status importu.

## 3) Post-submission checks

- GSC: sprawdź sekcję **Indexing → Pages** po 24-72h.
- Bing: sprawdź **Index Explorer** i raporty crawl.
- Zweryfikuj, czy liczba odkrytych URL rośnie.
- Jeśli są błędy, popraw i prześlij sitemapę ponownie.

## 4) Troubleshooting quick checks

- `sitemap.xml` zwraca HTTP 200 i poprawny XML.
- `robots.txt` nie blokuje krytycznych ścieżek.
- Canonicale wskazują na produkcyjny URL.
- Brak `noindex` na kluczowych stronach.

## Notes

- Zgłoszenie sitemapy jest czynnością manualną w panelach Google/Bing.
- Repo jest przygotowane technicznie; ten dokument zamyka część operacyjną wdrożenia SEO.
