# Airtable Schema & Test Checklist

Checklist operacyjna dla wdrożenia formularza kontaktowego z zapisem do Airtable.

## 1) Checklist: schema Airtable

Tabela: `ContactSubmissions`

### 1.1 Wymagane pola i typy

- [ ] `submissionId` — Single line text
- [ ] `name` — Single line text
- [ ] `email` — Email
- [ ] `phone` — Single line text (optional)
- [ ] `subject` — Single select
- [ ] `message` — Long text
- [ ] `status` — Single select
- [ ] `createdAt` — Date (include time)
- [ ] `source` — Single line text
- [ ] `ip` — Single line text (optional)
- [ ] `userAgent` — Long text (optional)

### 1.2 Wartości selectów

`subject`:
- [ ] `zmiana-koloru`
- [ ] `reklamy`
- [ ] `floty`
- [ ] `szkolenia`
- [ ] `dystrybucja`
- [ ] `inne`

`status`:
- [ ] `accepted`
- [ ] `duplicate`
- [ ] `queued`
- [ ] `failed`

### 1.3 Widoki operacyjne (zalecane)

- [ ] `New/Accepted` (filter: `status = accepted`)
- [ ] `Queued (Fallback)` (filter: `status = queued`)
- [ ] `Failed` (filter: `status = failed`)
- [ ] `Duplicates` (filter: `status = duplicate`)

### 1.4 Ustawienia środowiska

W `.env` i Netlify Environment Variables:

- [ ] `AIRTABLE_ENABLED=true`
- [ ] `AIRTABLE_API_KEY=...`
- [ ] `AIRTABLE_BASE_ID=app...`
- [ ] `AIRTABLE_TABLE_NAME=ContactSubmissions`
- [ ] `AIRTABLE_TIMEOUT_MS=4500` (lub inna zaakceptowana wartość)
- [ ] `AIRTABLE_MAX_RETRIES=1` (lub inna zaakceptowana wartość)

## 2) Checklist: test cases (minimum)

## 2.1 Test lokalny (Netlify Dev)

- [ ] Uruchom `netlify dev`
- [ ] Wejdź na `http://localhost:8888/kontakt`
- [ ] Potwierdź, że submit trafia na `/.netlify/functions/contact`

## 2.2 Matryca scenariuszy i oczekiwane wyniki

### A. Happy path

- [ ] Dane poprawne
- [ ] Oczekiwany HTTP status: `202`
- [ ] Oczekiwany `code`: `accepted`
- [ ] Rekord istnieje w Airtable
- [ ] Frontend pokazuje komunikat sukcesu

### B. Validation error

- [ ] Np. pusty email / za krótka wiadomość
- [ ] Oczekiwany HTTP status: `400`
- [ ] Oczekiwany `code`: `validation_error`
- [ ] Oczekiwane `errors[]` z polami
- [ ] Frontend pokazuje błędy per pole

### C. Duplicate submission (idempotencja)

- [ ] Wyślij ten sam payload 2x
- [ ] Drugie żądanie: HTTP `202`
- [ ] Drugie żądanie: `code = accepted_duplicate`
- [ ] Brak nowego rekordu (liczba rekordów bez zmian)

### D. Airtable timeout

- [ ] Zasymuluj timeout (np. obniż timeout + utrudnij połączenie)
- [ ] Oczekiwany HTTP status: `202`
- [ ] Oczekiwany `code`: `accepted_queued`
- [ ] Obecny structured log `contact_fallback_dead_letter`

### E. Airtable auth fail

- [ ] Ustaw niepoprawny `AIRTABLE_API_KEY`
- [ ] Oczekiwany HTTP status: `202`
- [ ] Oczekiwany `code`: `accepted_queued`
- [ ] Obecny structured log z `reasonCode = airtable_auth`

### F. Airtable rate limit / unavailable

- [ ] Wymuś odpowiedź `429` lub `5xx`
- [ ] Oczekiwany HTTP status: `202`
- [ ] Oczekiwany `code`: `accepted_queued`
- [ ] Obecny structured log z odpowiednim `reasonCode`

### G. Feature flag OFF

- [ ] `AIRTABLE_ENABLED=false`
- [ ] Oczekiwany HTTP status: `202`
- [ ] Oczekiwany `code`: `accepted`
- [ ] Brak prób zapisu do Airtable

## 2.3 Kontrakt odpowiedzi API

Dla wszystkich odpowiedzi obowiązuje:

- [ ] `success` (boolean)
- [ ] `code` (string)
- [ ] `message` (string)
- [ ] `submissionId` (string, gdy wygenerowano)

## 3) Checklist: rollout

- [ ] Preview deploy: przejście całej matrycy A–G
- [ ] Code review zmian backend + frontend
- [ ] Potwierdzenie env vars na produkcji
- [ ] Produkcyjny switch `AIRTABLE_ENABLED=true`
- [ ] Smoke test po wdrożeniu (happy path + validation)

## 4) Checklist: operacje i incydenty

- [ ] Monitoruj logi funkcji (`contact_submission_processed`, `contact_fallback_dead_letter`)
- [ ] Dla `accepted_queued` prowadź ręczny retry do Airtable
- [ ] Dokumentuj incydent: czas, skala, przyczyna, działania
- [ ] Po incydencie wykonaj test regresji scenariuszy A, B, C

## 5) Definition of Done

- [ ] Schemat Airtable zgodny z sekcją 1
- [ ] Wszystkie scenariusze A–G przetestowane
- [ ] Brak utraty leadów w testach awarii Airtable
- [ ] Frontend pokazuje poprawne komunikaty dla `accepted`, `accepted_duplicate`, `accepted_queued`, `validation_error`
- [ ] Rollback gotowy: `AIRTABLE_ENABLED=false`
