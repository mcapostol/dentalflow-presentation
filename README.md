# DentalFlow — prezentare HTML

Prezentare interactivă pentru **DentalFlow**, un concept fictiv de platformă pentru administrarea programărilor într-o clinică stomatologică sau într-un lanț de clinici.

Demo-ul prezintă programări, notificări SMS, dosarul pacientului, experiența mobilă și coordonarea mai multor sedii. Este o prezentare vizuală: trimiterea reală de SMS-uri, aplicațiile native, autentificarea și backend-ul clinicii nu sunt implementate în acest repository.

## Rulare locală

Este suficient un server static:

```bash
npx serve . -l 4173
```

Apoi deschide `http://localhost:4173`.

## Verificare și build

```bash
npm run verify
npm run build
```

`npm run verify` verifică sursele și sintaxa JavaScript. `npm run build` acceptă numai un working tree Git curat, copiază sursele în `dist/` și înregistrează commit-ul exact în `dist/build-info.json`.

Push-ul pe ramura `main` pornește workflow-ul GitHub Actions și publică automat conținutul din `dist/` în GitHub Pages.
