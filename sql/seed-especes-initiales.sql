
-- CHAMPI DE DEMAIN
-- Catalogue initial : 6 espèces
-- Statut brouillon : vérification mycologique nécessaire

insert into public.mushrooms
(scientific_name, common_names, slug, description, habitat,
 morphology, edibility, identification_warning, status)
values

(
'Boletus edulis',
array['Cèpe de Bordeaux','Cèpe'],
'boletus-edulis',
'Bolet reconnaissable à ses tubes et ses pores. La détermination exige plusieurs caractères.',
'Forêts de feuillus et de conifères selon les régions.',
'{"chapeau":"Brun, variable","hymenophore":"Tubes et pores","pied":"Robuste, souvent avec réseau clair"}'::jsonb,
'unknown',
'Ne pas consommer sur la seule base de cette fiche.',
'draft'
),

(
'Cantharellus cibarius',
array['Girolle','Chanterelle commune'],
'cantharellus-cibarius',
'Chanterelle présentant des plis épais et ramifiés sous le chapeau.',
'Forêts de feuillus ou de conifères.',
'{"chapeau":"Jaune à orangé","hymenophore":"Plis épais et ramifiés","pied":"Généralement plein"}'::jsonb,
'unknown',
'Risque de confusion avec des espèces ressemblantes. Faire vérifier.',
'draft'
),

(
'Craterellus cornucopioides',
array['Trompette-de-la-mort','Corne d’abondance'],
'craterellus-cornucopioides',
'Champignon sombre en forme de trompette.',
'Bois de feuillus.',
'{"chapeau":"En trompette","hymenophore":"Face externe grisâtre à noire","pied":"Creux"}'::jsonb,
'unknown',
'Identification à confirmer par un spécialiste.',
'draft'
),

(
'Hydnum repandum',
array['Pied-de-mouton'],
'hydnum-repandum',
'Champignon présentant des aiguillons sous le chapeau.',
'Bois de feuillus ou mixtes.',
'{"chapeau":"Crème à orangé pâle","hymenophore":"Aiguillons","pied":"Robuste"}'::jsonb,
'unknown',
'Ne jamais conclure à la comestibilité sur un seul caractère.',
'draft'
),

(
'Amanita phalloides',
array['Amanite phalloïde'],
'amanita-phalloides',
'Amanite extrêmement toxique, responsable d’intoxications mortelles.',
'Notamment dans les bois de feuillus.',
'{"chapeau":"Verdâtre à olivâtre, parfois pâle","hymenophore":"Lamelles blanches","pied":"Anneau","volve":"Volve en sac à la base"}'::jsonb,
'deadly',
'ESPÈCE MORTELLE. En cas d’ingestion suspectée, appeler immédiatement le 15 ou le 112.',
'draft'
),

(
'Amanita muscaria',
array['Amanite tue-mouches'],
'amanita-muscaria',
'Amanite toxique, typiquement rouge avec des restes blancs du voile.',
'Associée notamment aux bouleaux et aux conifères.',
'{"chapeau":"Souvent rouge avec des restes blancs","hymenophore":"Lamelles blanches","pied":"Blanc avec anneau possible"}'::jsonb,
'toxic',
'ESPÈCE TOXIQUE. Ne pas consommer.',
'draft'
)

on conflict (slug) do nothing;
