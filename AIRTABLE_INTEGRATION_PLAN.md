# Airtable Integration Plan (Contact Form)

## 1) Cel dokumentu

Celem jest wdrożenie zapisu zgłoszeń z formularza kontaktowego do Airtable w sposób odporny na błędy, bez utraty leadów i z kontrolowanym UX.

Plan zakłada rozwinięcie obecnego flow (Netlify Function) do wariantu produkcyjnego:

- walidacja danych po stronie backendu,
- idempotencja (antyduplikaty),
- zapis do Airtable z timeout/retry,
- fallback (dead-letter) przy niedostępności Airtable,
- czytelne kody błędów i stabilne komunikaty dla użytkownika.

## 2) Zakres

### In scope

- Rozbudowa `netlify/functions/contact.ts`.
- Ujednolicenie kontraktu odpowiedzi API.
- Integracja z Airtable REST API.
- Aktualizacja frontendowego handlingu odpowiedzi w formularzu.
- Dokumentacja środowisk i checklisty wdrożenia.

### Out of scope (na ten etap)

- Integracje mailingowe (SendGrid/Resend/Mailgun).
- Integracja z CRM poza Airtable.
- Zaawansowana kolejka asynchroniczna (np. osobny queue service).

## 3) Założenia

- Obecny endpoint formularza pozostaje: `/.netlify/functions/contact`.
- Hosting: Netlify.
- Frontend formularza pozostaje na stronie kontaktowej.
- Wrażliwe dane są przekazywane wyłącznie przez env vars.

## 4) Model danych w Airtable

Tabela: `ContactSubmissions`

Wymagane pola:

- `submissionId` (single line text, unique key logic po stronie aplikacji)
- `name` (single line text)
- `email` (email)
- `phone` (single line text, optional)
- `subject` (single select: `zmiana-koloru`, `reklamy`, `floty`, `szkolenia`, `dystrybucja`, `inne`)
- `message` (long text)
- `status` (single select: `accepted`, `duplicate`, `queued`, `failed`)
- `createdAt` (date time)
- `source` (single line text, np. `contact-form`)
- `ip` (single line text, optional)
- `userAgent` (long text, optional)

Widoki operacyjne (zalecane):

- `New/Accepted`
- `Queued (Fallback)`
- `Failed`
- `Duplicates`

## 5) Kontrakt API (backend -> frontend)

Format odpowiedzi (JSON):

- `success`: boolean
- `code`: string
- `message`: string
- `submissionId`: string (jeśli wygenerowano)

Statusy HTTP:

- `202 Accepted`: zgłoszenie przyjęte (zapisane lub bezpiecznie zakolejkowane fallbackiem)
- `400 Bad Request`: błąd walidacji
- `429 Too Many Requests` (opcjonalnie, jeśli dołożymy rate limit)
- `502 Bad Gateway`: błąd po stronie Airtable
- `500 Internal Server Error`: nieoczekiwany błąd funkcji

Przykładowe `code`:

- `accepted`
- `accepted_duplicate`
- `accepted_queued`
- `validation_error`
- `airtable_auth`
- `airtable_rate_limit`
- `airtable_timeout`
- `airtable_unavailable`
- `internal_error`

## 6) Etapy wdrożenia

### Etap 1 — Kontrakt i błędy

Zakres:

- Dodać centralny builder odpowiedzi (jednolity shape).
- Dodać mapowanie błędów wewnętrznych na `code` + status HTTP.

Deliverables:

- Uzgodniony kontrakt odpowiedzi.
- Spójne komunikaty dla frontendu.

Acceptance criteria:

- Wszystkie odpowiedzi z funkcji mają ten sam format JSON.
- Brak „gołych” wyjątków zwracanych do klienta.

Rollback:

- Powrót do prostego `success/error` w jednej funkcji helper.

---

### Etap 2 — Airtable schema i konfiguracja env

Zakres:

- Utworzyć tabelę i pola w Airtable.
- Ustawić env vars w projekcie i Netlify.

Nowe env vars:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME=ContactSubmissions`
- `AIRTABLE_ENABLED=true` (feature flag)

Deliverables:

- Gotowy base + tabela.
- Uzupełniony `.env.example`.

Acceptance criteria:

- Funkcja widzi env vars i nie startuje w trybie Airtable bez wymaganych wartości.

Rollback:

- `AIRTABLE_ENABLED=false` wyłącza zapis do Airtable.

---

### Etap 3 — Integracja zapisu Airtable

Zakres:

- Implementacja klienta HTTP do Airtable.
- Mapowanie pól formularza do `fields` Airtable.
- Timeout requestu + 1 retry.

Deliverables:

- Funkcja zapisuje rekordy do Airtable.

Acceptance criteria:

- Dla poprawnych danych rekord pojawia się w tabeli.
- Przy timeout funkcja nie „wisi” (kontrolowany timeout).

Rollback:

- Wyłączenie ścieżki Airtable feature flagą.

---

### Etap 4 — Idempotencja i antyduplikaty

Zakres:

- Generowanie `submissionId`.
- Sprawdzenie, czy taki rekord już istnieje.
- Obsługa duplikatu bez tworzenia nowego wpisu.

Deliverables:

- Stabilna logika antyduplikatów.

Acceptance criteria:

- Wielokrotne wysłanie tego samego payloadu w krótkim czasie nie tworzy duplikatów.
- Frontend dostaje `accepted_duplicate`.

Rollback:

- Tymczasowe wyłączenie checku duplicate (zostaje zwykły insert).

---

### Etap 5 — Fallback (dead-letter)

Zakres:

- Przy niedostępnym Airtable zapisać minimalny rekord fallback (na start: structured logs).
- Zwrócić `202` z kodem `accepted_queued`.

Deliverables:

- Brak utraty zgłoszeń przy incydentach Airtable.

Acceptance criteria:

- Symulacja niedostępnego Airtable kończy się kontrolowaną odpowiedzią i fallback logiem.

Rollback:

- Wyłączenie fallback i twardy błąd 502 (krótkoterminowo, awaryjnie).

---

### Etap 6 — Frontend UX i komunikaty

Zakres:

- Aktualizacja obsługi odpowiedzi API na stronie formularza.
- Mapowanie `code` na komunikaty UX.

Deliverables:

- Użytkownik dostaje jasny komunikat zależny od stanu (`accepted`, `queued`, `validation`).

Acceptance criteria:

- Brak regresji dla walidacji klienta i loading state.
- Komunikaty są spójne dla wszystkich kategorii błędów.

Rollback:

- Powrót do obecnego komunikatu `success/error`.

---

### Etap 7 — Obserwowalność i operacje

Zakres:

- Standaryzacja logów (`submissionId`, `code`, `durationMs`).
- Prosta instrukcja operacyjna: jak obsługiwać `queued`.

Deliverables:

- Playbook operacyjny dla incydentów.

Acceptance criteria:

- Na podstawie logów da się prześledzić los pojedynczego zgłoszenia.

Rollback:

- Ograniczenie logów do minimum, jeśli pojawi się szum.

---

### Etap 8 — Testy i rollout

Zakres:

- Testy lokalne + preview + production.
- Wdrożenie etapowe z checkpointami.

Test matrix (minimum):

- Happy path (`accepted`)
- Validation fail (`validation_error`)
- Airtable timeout (`airtable_timeout` -> `accepted_queued`)
- Airtable auth fail (`airtable_auth`)
- Duplicate (`accepted_duplicate`)

Deliverables:

- Raport testów i decyzja o produkcyjnym włączeniu flagi.

Acceptance criteria:

- Wszystkie krytyczne scenariusze przechodzą.

Rollback:

- Natychmiastowe `AIRTABLE_ENABLED=false`.

## 7) Strategia wdrożenia (bez pośpiechu)

Rekomendowane tempo:

1. Etap 1-2 na branchu roboczym.
2. Etap 3-4 po code review.
3. Etap 5-6 po testach preview.
4. Etap 7-8 przed i po produkcyjnym switchu.

Każdy etap kończymy krótkim checkpointem:

- Co działa
- Co jest ryzykiem
- Jak wycofać zmianę

## 8) Ryzyka i mitigacje

- **Rate limit Airtable** -> retry + fallback queued.
- **Błędy konfiguracji env** -> startup validation i jasny log błędu.
- **Duplikaty zgłoszeń** -> idempotencja + `submissionId`.
- **Niedostępność usługi** -> fallback i playbook ręcznego retry.

## 9) Kryteria „Done” dla całej integracji

- Zgłoszenia są zapisywane w Airtable w kontrolowany sposób.
- Brak utraty leadów przy chwilowych awariach Airtable.
- Frontend pokazuje właściwe komunikaty dla wszystkich głównych stanów.
- Integrację można wyłączyć jedną flagą (`AIRTABLE_ENABLED`).
- Istnieje checklista testowa i instrukcja operacyjna.

## 10) Szacunek czasowy

- Etap 1-2: 2-3h
- Etap 3-5: 6-9h
- Etap 6-8: 3-5h

Łącznie: około 11-17h spokojnej implementacji z testami i rollback checkpoints.
