# HA Village — V4.6

## Un calendrier vivant

Le village suit désormais la date civile et le fuseau de son horloge : **7 traditions quotidiennes, 8 rendez-vous hebdomadaires, 11 ambiances annuelles et 10 nouvelles surprises**, en plus des repas, métiers, animaux et rendez-vous du clocher déjà présents. Ces traditions sont celles de ce village fictif ; il ne s’agit pas d’un agenda extérieur ni du calendrier officiel des fêtes de Bayonne.

| Rythme | Animations |
| --- | --- |
| Chaque jour | Livraisons 6 h 30–8 h ; jardinage 8 h–9 h 30 ; entretien 10 h–11 h 30 ; histoire 14 h 30–15 h 30 ; repas à la taverne 18 h–19 h 30 ; lanternes 20 h 30–21 h 30 ; étoiles 22 h–23 h 30 |
| Lundi | Atelier ouvert, 10 h–11 h 50 |
| Mardi | Rendez-vous des pêcheurs, 15 h–17 h |
| Mercredi | Jeux et ballon sur le parvis, 14 h–16 h |
| Jeudi | Préparation de bouquets, 10 h–11 h 50 |
| Vendredi | Musique et danse, 18 h–20 h 30 |
| Samedi et dimanche | Deux étals de marché, 9 h–11 h 55 |
| Dimanche | Pique-nique, 14 h–17 h |

Au fil de l’année : vœux du **1er janvier**, bouquets du **14 février**, fête du printemps le **21 mars**, fleurs du **1er mai**, musique le **21 juin**, parade le **14 juillet**, récoltes le **22 septembre**, Halloween le **31 octobre**, préparatifs du **15 au 23 décembre**, Noël du **24 au 26 décembre**, réveillon le **31 décembre**. Les décorations restent présentes pendant les dates concernées ; les groupes se réunissent dans les plages horaires définies dans `calendar.js`.

Fanions, étals, bouquets, citrouilles éclairées, sapin et cadeaux sont rendus dans la scène. Les personnages portent des accessoires, jouent au ballon ou avec la neige, lisent aux enfants, mangent assis et livrent leurs paquets. Un échange de colis attend réellement l’arrivée des deux voisins avant le passage de main. À Halloween, de petits chapeaux et quelques chauves-souris complètent l’ambiance. Des feux d’artifice discrets, sans son ni flash plein écran, apparaissent le 31 décembre à partir de 23 h 58, les dix premières minutes du 1er janvier et le 14 juillet entre 22 h et 23 h, si la météo le permet.

Les saisons ajoutent pétales, papillons, feuilles d’automne et lucioles aux beaux jours. La saison utilise ici des groupes de mois fixes (décembre–février, mars–mai, juin–août, septembre–novembre), sans calcul d’équinoxe. Les boules de neige nécessitent la météo Neige ; les étoiles nécessitent un ciel dégagé.

Les surprises comprennent un échange de colis, de l’entraide, un ballon, un bouquet offert, un envol d’oiseaux, un goûter, une histoire, des boules de neige, une étoile filante et une ronde de lanternes. Le tirage évite deux nouvelles surprises identiques à la suite. Les animations aléatoires précédentes (chien, chat, poules, pêche, musique et conversations) restent disponibles.

Une seule scène collective joue à la fois. Les départs sont échelonnés, les activités commencent à destination, les points occupés font attendre les suivants, puis chacun reprend sa routine. Déjeuner et cloches restent prioritaires ; pluie et orage interrompent les sorties. Les trois veilleurs suffisent pour les petites surprises nocturnes ; certaines fêtes peuvent exceptionnellement réveiller davantage d’habitants.

Une activité quotidienne ou hebdomadaire démarre si la page est ouverte pendant sa plage horaire, au plus une fois par journée et par session. Les fêtes peuvent revenir après 25 minutes ; deux déclenchements du calendrier sont espacés d’au moins sept minutes. Une scène dure généralement moins de quatre minutes. Fermer la page n’exécute rien en arrière-plan ; la reprise ne rejoue pas en rafale ce qui a été manqué. Un changement de date ou la fin de la plage horaire libère les participants. Les échéances réelles restent actives en mode de mouvements réduits.

Dans **`?debug=1` → Debug → Voyager dans le calendrier**, choisir librement une date et une heure, ou sélectionner l’une des 36 scènes dans la liste puis **Voir cette scène**. **Surprise** choisit un aperçu aléatoire. L’aperçu règle la date, l’heure et la météo pour rendre la scène visible, sans téléporter les habitants. Le programme de la journée est consultable dans le panneau repliable. **Auto** retire tous les forçages et retrouve l’horloge locale ou Home Assistant. Aucune commande supplémentaire dans la vue normale.

## Le clocher au cœur du village

L’église occupe désormais le centre du village. Son cadran est presque deux fois plus grand que dans la V4.4 ; les aiguilles contrastées restent sombres sur une face éclairée la nuit. Une plaque encadrée de laiton sous le cadran affiche l’heure exacte en **HH:MM**, synchronisée avec la même horloge et les mêmes forçages que les aiguilles.

Sur téléphone, toucher le clocher rapproche doucement la vue ; un second toucher revient au village entier. Au clavier : **H** pour rapprocher ou revenir, **Échap** pour revenir. La préférence de mouvements réduits rend ce changement instantané. L’heure et la météo restent sans badge flottant.

La fontaine se trouve dans un petit jardin à droite de l’église. Les chemins contournent les deux monuments, y compris leurs toitures projetées. Musiciens, auditeurs, conversations et rendez-vous se retrouvent sur le parvis ; les gardiens s’arrêtent au pied du clocher. Les rassemblements de midi regardent l’église. Les ondulations, éclaboussures et lumières suivent les nouveaux emplacements.

## Une journée plus vivante

Les 24 habitants ont des rôles et des tournées : jardiniers (arrosage, récolte, graines pour les poules), artisans, livreurs (chargement à l’atelier puis livraison), pêcheurs, musiciens, lecteurs, entretien de la place, deux enfants et trois veilleurs. Des places dédiées sont réservées pendant le trajet et l’activité, pour éviter que plusieurs personnages utilisent le même banc ou poste de travail. Les routines respectent les repas, la mise à l’abri et les rendez-vous du clocher.

La pêche, la lecture, l’arrosage, la musique, le balayage, les repas et l’artisanat possèdent de petits gestes et accessoires animés. Des auditeurs proches peuvent rejoindre un musicien ; le chien accompagne parfois un voisin ; les poules se rapprochent des graines ; le chat se recroqueville pendant ses longues pauses. Les enfants sont plus petits et marchent plus vite. Aucun son automatique.

La marche conserve des chemins sûrs, ralentit dans les virages et à l’arrivée, utilise un décalage latéral progressif, et prend en compte l’encombrement. Le freinage de groupe est borné et les positions rendues sont vérifiées contre bâtiments, fontaine et rivière. Ce n’est pas un moteur physique de collisions entre tous les sprites : de brefs croisements restent possibles aux intersections.

Toucher un habitant affiche son nom et une bulle de salut. Au clavier, Entrée ou Espace sur le village salue successivement les habitants visibles. Les bulles d’activité sont un peu plus grandes, espacées, décalées dans le temps et limitées à cinq simultanément.

Dans `?debug=1`, **10 h · Activités** permet d’observer les métiers, **13 h · Déjeuner** les repas. Les boutons Pêche, Musique, Poules et Chien placent la scène à 10 h au soleil et lancent un trajet naturel vers l’activité, sans téléportation. **Auto** restaure l’heure et la météo automatiques. La vue normale ne comporte toujours aucun panneau de commandes.

Les parapluies sont supprimés. Les habitants accélèrent au départ, ralentissent à destination, gardent une distance de suivi et se décalent à droite pour se croiser. Les pauses correspondent à une activité, plutôt qu’à un changement de destination permanent.

Entre 12 h et 14 h, trois services de huit habitants se succèdent aux tables existantes de la taverne (12 h–12 h 35, 12 h 40–13 h 15, 13 h 20–13 h 55), avec des départs échelonnés. Ils restent à leur place pour manger puis reprennent leur journée. Le rassemblement de midi reste prioritaire et se termine avant le déjeuner. Le bouton Debug « Jour » permet de voir le service de 13 h.

Le jardinage et l’artisanat ont des pauses de travail plus longues ; les livraisons relient les bâtiments. Deux voisins à proximité peuvent s’arrêter, se tourner l’un vers l’autre et discuter. Des bulles monochromes indiquent repas, conversation, jardinage, outils, colis et musique ; cinq au maximum, espacées et intermittentes. Sous la pluie, le déjeuner se fait à l’intérieur de la taverne ; pendant l’orage, la mise à l’abri reste prioritaire. Aucune dépendance réseau à l’exécution.

Une véritable église en pierre et son clocher remplacent la maison au toit bleu. Les aiguilles de son cadran suivent l’heure du village, avec un éclairage doux la nuit. Aucun badge d’heure ou de météo ; l’heure exacte et la date restent disponibles aux lecteurs d’écran.

24 habitants parcourent les chemins : livraisons, jardinage, promenades, conversations et pauses. Trois veilleurs restent dehors la nuit. Les destinations tiennent compte de leur fréquentation et chaque rassemblement dispose de places distinctes.

Rendez-vous automatiques selon l’heure locale (ou le fuseau fourni par HA) : **12 h**, cloche animée et rassemblement ; **16 h 20**, petite danse sur la place ; **4 h 20**, sortie aux lanternes. Durée de 100 à 120 secondes, sans audio. La page doit être ouverte pendant la minute correspondante : aucun rattrapage des heures manquées. Chaque rendez-vous est déclenché au plus une fois par journée pendant la session ; recharger pendant cette minute peut le relancer. Le mode `?debug=1` propose trois boutons de prévisualisation ; Auto annule la prévisualisation. Les mouvements réduits désactivent les animations, sans bloquer l’heure ni l’expiration des événements.

Un diorama de village animé, destiné à une tuile Home Assistant. Le décor original est une illustration pixel-art vue en plongée, avec une place, quatre bâtiments principaux, un abri, un potager, un pont et une rivière. L’horloge fonctionnelle, les habitants, animaux, éclairages, fumées, ondulations et effets météo sont dessinés séparément en Canvas 2D.

## Utilisation

Le projet est statique : aucun build, aucune dépendance à installer, aucune clé API. Il conserve les chemins relatifs nécessaires à GitHub Pages sous `/ha-tamagotchi/`.

- Vue normale : `index.html`. L’heure et la date suivent le fuseau du téléphone.
- Mode test : `index.html?debug=1`, puis le petit bouton **Debug**. Les quatre périodes et les six météos sont indépendantes. **Auto** efface les deux forçages et reprend les données automatiques, y compris celles de Home Assistant si elles ont été fournies.
- Pleine surface de tuile : détection automatique d’une iframe, ou `?embed=1`.
- Sans Home Assistant, la météo est **simulée**, précisée dans le Debug et la description accessible. Elle est stable pendant trois heures et tient compte du mois. Ce n’est pas la météo réelle de Bayonne. Aucun service extérieur, géolocalisation ou appel réseau météo n’est utilisé.
- Les forçages ne sont pas mémorisés. Un rechargement repart en Auto.

Pour un essai local, servir le dossier en HTTP, par exemple avec Python déjà installé :

```sh
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`. Les modules ES nécessitent un serveur HTTP ; le double-clic sur `index.html` en `file://` n’est pas le mode de lancement prévu.

## Dans Home Assistant

Pour une installation entièrement locale, copier `index.html`, `style.css`, tous les fichiers `.js` à la racine et le dossier `assets` dans `/config/www/ha-tamagotchi/`, puis utiliser l’adresse `/local/ha-tamagotchi/index.html` dans une carte **Page web**. Le dossier doit être conservé au complet. Le rendu ne requiert aucun cloud après cette copie.

L’éditeur visuel de la carte permet de renseigner l’URL et la proportion. Exemple de configuration équivalente :

```yaml
type: iframe
url: /local/ha-tamagotchi/index.html
aspect_ratio: 66.67%
```

Une proportion de 66.67 % préserve l’ensemble du décor ; 75 % donne une tuile un peu plus haute avec un léger recadrage horizontal. Une iframe extrêmement haute recadre les bords de la scène : privilégier une tuile large.

La simple carte Page web affiche le village mais ne lui transmet pas automatiquement les états HA. Le pont ci-dessous prépare cette étape ; aucun accès à `window.parent.document`, aucune entité présumée, aucun jeton stocké.

## Pont de données Home Assistant

Un adaptateur pourra alimenter l’API publique après l’événement `ha-village:ready`. L’état météo utilise les valeurs natives Home Assistant ou les six valeurs internes.

```js
window.haVillage.setState({
  datetime: new Date().toISOString(),
  timeZone: 'Europe/Paris',
  weather: 'lightning-rainy'
});
```

`datetime` est une ancre : l’horloge continue d’avancer après réception. `timeZone` est facultatif et validé. Les champs peuvent être fournis séparément. Les mises à jour HA restent reçues pendant un forçage Debug ; Auto retrouve donc le dernier état reçu.

Pour une iframe, l’adaptateur situé dans le parent peut utiliser :

```js
const frame = document.querySelector('iframe'); // sélectionner l’iframe du village
const origin = new URL(frame.src, location.href).origin;
frame.contentWindow.postMessage({
  type: 'ha-village:state',
  state: { datetime: new Date().toISOString(), timeZone: 'Europe/Paris', weather: 'rainy' }
}, origin);
```

En hébergement local de même origine, aucune option supplémentaire n’est requise. Si le village est sur GitHub Pages et HA sur un autre domaine, ajouter **l’origine exacte de HA** à l’URL du village, par exemple `?ha_origin=https%3A%2F%2Fha.example`. Les messages ne sont acceptés que du parent direct et de cette origine. Ne jamais passer de jeton dans l’URL. Cet exemple décrit le contrat d’un futur adaptateur ; il n’ajoute pas une carte personnalisée HA.

L’adaptateur devra envoyer la météo au chargement et périodiquement, par exemple toutes les cinq minutes. Après **30 minutes sans réception d’un état météo**, la scène revient à la météo simulée et actualise sa description accessible. `unknown`, `unavailable` ou `null` provoquent ce repli immédiatement. Un `window.haVillage.reset()` complet revient à l’heure du téléphone, efface les données externes et les forçages.

| Home Assistant | Scène |
| --- | --- |
| `sunny`, `clear-night` | Soleil / ciel dégagé |
| `cloudy`, `partlycloudy`, `windy`, `windy-variant` | Nuageux |
| `rainy`, `pouring` | Pluie |
| `lightning`, `lightning-rainy`, `exceptional` | Orage |
| `snowy`, `snowy-rainy`, `hail` | Neige |
| `fog` | Brouillard |

Les conditions moins courantes sont regroupées dans les six ambiances demandées ; il ne s’agit pas d’une représentation météorologique exhaustive.

## Organisation

| Fichier | Responsabilité |
| --- | --- |
| `index.html` / `style.css` | Surcouche, responsive, commandes discrètes |
| `main.js` | Initialisation, boucle 30 i/s, cycle de vie, repli météo |
| `scene.js` | Décor en cache, lumière, eau, fenêtres, lanternes, fumée |
| `camera.js` | Rapprochement du clocher, cadrage et coordonnées tactiles |
| `church-clock.js` | Aiguilles, plaque HH:MM, éclairage et cloche animée |
| `events.js` | Rendez-vous quotidiens, détection sur l’heure civile |
| `calendar.js` | Dates, traditions, priorités, temporisation et aperçus |
| `happenings.js` | Parcours et étapes des scènes collectives |
| `calendar-effects.js` | Décors de fêtes, saisons, ballon, oiseaux et feux d’artifice |
| `navigation.js` | Chemins, freinage, virages, suivi et positions sûres |
| `routines.js` | Tournées, postes d’activité et pictogrammes |
| `activity-effects.js` | Accessoires et gestes des activités |
| `world.js` | Coordonnées du décor, chemins, points d’intérêt |
| `entities.js` | Habitants, chien, chat, poules, trajets et événements |
| `time.js` | Horloge locale ou externe, fuseau, quatre périodes |
| `weather.js` | Six météos, simulation locale, particules, textes d’ambiance |
| `bridge.js` | Validation des données et pont HA |
| `ui.js` | Affichage et forçages réservés au Debug |
| `assets/village-center.webp` | Décor central optimisé, 1536 × 1024, environ 507 ko |

Pour modifier le plan du village, mettre à jour le décor et ses ancrages dans `world.js` ensemble. Le décor est original, généré pour ce projet ; aucun asset de RimWorld n’a été utilisé. Les personnages sont des sprites dessinés en code, avec couleurs, silhouettes, pas et orientations distincts.

Le décor V4.5 a été créé avec l’outil Imagegen intégré, à partir du décor V4.4. Direction de la retouche : conserver le style pixel-art, la taverne, le potager, l’atelier et la rivière ; déplacer l’église au centre, libérer le parvis et placer la fontaine à droite ; laisser le cadran et la plaque vides pour leur rendu fonctionnel. Le PNG 1536 × 1024 a été converti en WebP qualité 86. Les ancrages mesurés et les textes fonctionnels sont définis dans le code.

## Animations et performance

- Les 24 habitants suivent un graphe de chemins. Ils contournent l’église et la fontaine et traversent la rivière uniquement par le pont. Un changement d’heure ou de météo termine d’abord le segment en cours, sans téléportation.
- La nuit, 21 habitants rentrent chez eux ; trois veilleurs continuent leur ronde. Le soir et sous la pluie, l’activité ralentit. Les orages poussent les habitants à se mettre à l’abri.
- Un chien et un chat suivent les allées ; trois poules picorent et se déplacent près du potager. Événements espacés, vitesses bornées, petits groupes près de l’horloge.
- Quatre périodes : matin 6–10 h, jour 10–18 h, soir 18–22 h, nuit 22–6 h. Transitions fondues de 1,4 seconde. Ce sont des horaires fixes, pas un calcul astronomique du soleil.
- Une seule image locale, sans dépendances de production. Terrain et pierre de l’horloge précomposés lors des changements d’ambiance ; maximum de 135 particules et de 1,8 million de pixels de rendu, DPR plafonné à 1,5.
- Le dessin est limité à 30 images/s ; aucun calcul météo réseau. Mise en pause quand l’onglet est masqué ou la tuile hors écran. Reprise avec un pas de simulation borné.
- La préférence système **Réduire les animations** fige les déplacements, flocons, fumée et eau, supprime les éclairs et conserve l’actualisation de l’horloge et de l’ambiance.
- Texte français, commandes Debug tactiles de 44 px, états `aria-pressed`, fermeture par Échap, description de l’heure et de la météo pour les lecteurs d’écran.

## Vérification

Avec Node.js 18 ou supérieur déjà installé :

```sh
npm test
```

Les tests couvrent les limites horaires, le fuseau et le passage de minuit, les dates bissextiles, les traditions selon le jour, les priorités et temporisations, l’arrivée effective aux activités, l’échange de colis, les retours nocturnes, les interruptions sans téléportation, les trajets et obstacles, les particules bornées, le filtrage des messages et les ressources locales. Aucun paquet npm n’est nécessaire.

Références officielles : [carte Page web](https://www.home-assistant.io/dashboards/iframe/), [conditions météo](https://www.home-assistant.io/integrations/weather/).
