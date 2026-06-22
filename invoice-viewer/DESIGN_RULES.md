## INTERDIT — variables CSS directes
Ne jamais écrire `var(--bg-primary)`, `var(--accent)`, `var(--radius)` 
ou toute variable CSS custom dans du JSX ou du CSS externe.
Toutes les valeurs passent par les classes Tailwind uniquement.
Si une valeur n'a pas de classe Tailwind, elle n'existe pas dans ce projet.
