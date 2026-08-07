# The Sounds Project Vol. 9 — Day 2

Route planner mobile-first untuk Sabtu, 8 Agustus 2026. Pilih set; set bentrok lintas-stage terkunci. Durasi set diperkirakan sampai set berikutnya pada stage sama.

## Run

```bash
python3 -m http.server 8000
open http://localhost:8000
```

`file://` tidak dipakai karena browser memblokir `fetch()` JSON.

## Verify

```bash
python3 validate.py
```

Source: [official Instagram carousel](https://www.instagram.com/p/DblJ8felLm-/?img_index=1). Audit detail ada di [`docs/audit.md`](docs/audit.md).

Data Day 2 punya 7 stage dan 42 event. Subject to change without prior notice sesuai sumber resmi.

Skipped: framework, build step, external dependency. Add only when schedule editing, deployment, or larger app scope needs them.
### Self-check

`validate.py` covers stage count, unique rows, time format/order, confirmed Main Stage rows, and Day 2 contamination.

## License

Project-specific working artifact; source schedule belongs to event organizer.

### Ponytail

Planner memakai vanilla JS dan CSS horizontal scroll; add framework only when interaction/state exceeds this small route planner.

### Data status

Verified against full-resolution Instagram carousel slides in browser. Exact unresolved rows are listed in audit; no 100% claim.

## Browser smoke

Serve repo over HTTP, load page, confirm 7 stage groups, 42 event cards, select one set, confirm conflict cards disable, click selected card/chip to remove.
