# HA Village — V4.3

Les parapluies sont supprimés. Les habitants accélèrent au départ, ralentissent à destination, gardent une distance de suivi et se décalent à droite pour se croiser. Les pauses correspondent à une activité, plutôt qu’à un changement de destination permanent.

Entre 12 h et 14 h, trois services de huit habitants se succèdent aux tables existantes de la taverne (12 h–12 h 35, 12 h 40–13 h 15, 13 h 20–13 h 55), avec des départs échelonnés. Ils restent à leur place pour manger puis reprennent leur journée. Le rassemblement de midi reste prioritaire et se termine avant le déjeuner. Le bouton Debug « Jour » permet de voir le service de 13 h.

Le jardinage et l’artisanat ont des pauses de travail plus longues ; les livraisons relient les bâtiments. Deux voisins à proximité peuvent s’arrêter, se tourner l’un vers l’autre et discuter. Des bulles monochromes indiquent repas, conversation, jardinage, outils, colis et musique ; cinq au maximum, espacées et intermittentes. Sous la pluie, le déjeuner se fait à l’intérieur de la taverne ; pendant l’orage, la mise à l’abri reste prioritaire. Aucun nouvel asset ni dépendance réseau.

Une véritable église en pierre et son clocher remplacent la maison au toit bleu. Les aiguilles de son cadran suivent l’heure du village, avec un éclairage doux la nuit. La fontaine retrouve sa place centrale. Aucun badge d’heure ou de météo ; l’heure exacte et la date restent disponibles aux lecteurs d’écran.

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
| `church-clock.js` | Aiguilles du clocher, éclairage et cloche animée |
| `events.js` | Rendez-vous quotidiens, détection sur l’heure civile |
| `world.js` | Coordonnées du décor, chemins, points d’intérêt |
| `entities.js` | Habitants, chien, chat, poules, trajets et événements |
| `time.js` | Horloge locale ou externe, fuseau, quatre périodes |
| `weather.js` | Six météos, simulation locale, particules, textes d’ambiance |
| `bridge.js` | Validation des données et pont HA |
| `ui.js` | Affichage et forçages réservés au Debug |
| `assets/village-church.webp` | Décor original optimisé, 1536 × 1024 |

Pour modifier le plan du village, mettre à jour le décor et ses ancrages dans `world.js` ensemble. Le décor est original, généré pour ce projet ; aucun asset de RimWorld n’a été utilisé. Les personnages sont des sprites dessinés en code, avec couleurs, silhouettes, pas et orientations distincts.

## Animations et performance

- Six habitants suivent un graphe de chemins. Ils contournent l’horloge et traversent la rivière uniquement par le pont. Un changement d’heure ou de météo termine d’abord le segment en cours, sans téléportation.
- La nuit, cinq habitants rentrent chez eux ; un veilleur continue sa ronde avec une lanterne. Le soir et sous la pluie, l’activité ralentit. Les orages poussent les habitants à se mettre à l’abri.
- Un chien et un chat suivent les allées ; trois poules picorent et se déplacent près du potager. Événements espacés, vitesses bornées, petits groupes près de l’horloge.
- Quatre périodes : matin 6–10 h, jour 10–18 h, soir 18–22 h, nuit 22–6 h. Transitions fondues de 1,4 seconde. Ce sont des horaires fixes, pas un calcul astronomique du soleil.
- Une seule image locale, sans dépendances de production. Terrain et pierre de l’horloge précomposés lors des changements d’ambiance ; maximum de 135 particules et de 1,8 million de pixels de rendu, DPR plafonné à 1,5.
- Le dessin est limité à 30 images/s ; aucun calcul météo réseau. Mise en pause quand l’onglet est masqué ou la tuile hors écran. Reprise avec un pas de simulation borné.
- La préférence système **Réduire les animations** fige les déplacements, flocons, fumée et eau, supprime les éclairs et conserve l’actualisation de l’horloge et de l’ambiance.
- Texte français, commandes tactiles de 44 px, états `aria-pressed`, fermeture par Échap, information météo visible sans interpréter le dessin.

## Vérification

Avec Node.js 18 ou supérieur déjà installé :

```sh
npm test
```

Les tests couvrent les limites horaires, le fuseau et le passage de minuit, les forçages indépendants, les trajets et obstacles, les retours nocturnes, les transitions rapides, les particules et éclairs bornés, le filtrage des messages et les ressources locales. Aucun paquet npm n’est nécessaire.

Références officielles : [carte Page web](https://www.home-assistant.io/dashboards/iframe/), [conditions météo](https://www.home-assistant.io/integrations/weather/).
