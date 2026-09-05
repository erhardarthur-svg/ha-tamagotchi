# HA Village — V4

Un diorama de village animé, destiné à une tuile Home Assistant. Le décor original est une illustration pixel-art vue en plongée, avec une place, une fontaine, quatre bâtiments principaux, un abri, un potager, un pont et une rivière. Les habitants, animaux, éclairages, fumées, ondulations et effets météo sont animés séparément en Canvas 2D.

## Utilisation

Le projet est statique : aucun build, aucune dépendance à installer, aucune clé API. Il conserve les chemins relatifs nécessaires à GitHub Pages sous `/ha-tamagotchi/`.

- Vue normale : `index.html`. L’heure et la date suivent le fuseau du téléphone.
- Mode test : `index.html?debug=1`, puis le petit bouton **Debug**. Les quatre périodes et les six météos sont indépendantes. **Auto** efface les deux forçages et reprend les données automatiques, y compris celles de Home Assistant si elles ont été fournies.
- Pleine surface de tuile : détection automatique d’une iframe, ou `?embed=1`.
- Sans Home Assistant, la météo est **simulée**, explicitement signalée dans l’interface. Elle est stable pendant trois heures et tient compte du mois. Ce n’est pas la météo réelle de Bayonne. Aucun service extérieur, géolocalisation ou appel réseau météo n’est utilisé.
- Les forçages ne sont pas mémorisés. Un rechargement repart en Auto.

Pour un essai local, servir le dossier en HTTP, par exemple avec Python déjà installé :

```sh
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/`. Les modules ES nécessitent un serveur HTTP ; le double-clic sur `index.html` en `file://` n’est pas le mode de lancement prévu.

## Dans Home Assistant

Pour une installation entièrement locale, copier `index.html`, `style.css`, les huit fichiers `.js` et le dossier `assets` dans `/config/www/ha-tamagotchi/`, puis utiliser l’adresse `/local/ha-tamagotchi/index.html` dans une carte **Page web**. Le dossier doit être conservé au complet. Le rendu ne requiert aucun cloud après cette copie.

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

L’adaptateur devra envoyer la météo au chargement et périodiquement, par exemple toutes les cinq minutes. Après **30 minutes sans réception d’un état météo**, la scène revient à la météo simulée et réaffiche son indication. `unknown`, `unavailable` ou `null` provoquent ce repli immédiatement. Un `window.haVillage.reset()` complet revient à l’heure du téléphone, efface les données externes et les forçages.

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
| `world.js` | Coordonnées du décor, chemins, points d’intérêt |
| `entities.js` | Habitants, chien, chat, poules, trajets et événements |
| `time.js` | Horloge locale ou externe, fuseau, quatre périodes |
| `weather.js` | Six météos, simulation locale, particules, textes d’ambiance |
| `bridge.js` | Validation des données et pont HA |
| `ui.js` | Affichage et forçages réservés au Debug |
| `assets/village.webp` | Décor original optimisé, 1536 × 1024 |

Pour modifier le plan du village, mettre à jour le décor et ses ancrages dans `world.js` ensemble. Le décor est original, généré pour ce projet ; aucun asset de RimWorld n’a été utilisé. Les personnages sont des sprites dessinés en code, avec couleurs, silhouettes, pas et orientations distincts.

## Animations et performance

- Six habitants suivent un graphe de chemins. Ils contournent la fontaine et traversent la rivière uniquement par le pont. Un changement d’heure ou de météo termine d’abord le segment en cours, sans téléportation.
- La nuit, cinq habitants rentrent chez eux ; un veilleur continue sa ronde avec une lanterne. Le soir et sous la pluie, l’activité ralentit. Les orages poussent les habitants à se mettre à l’abri.
- Un chien et un chat suivent les allées ; trois poules picorent et se déplacent près du potager. Événements espacés, vitesses bornées, petits groupes près de la fontaine.
- Quatre périodes : matin 6–10 h, jour 10–18 h, soir 18–22 h, nuit 22–6 h. Transitions fondues de 1,4 seconde. Ce sont des horaires fixes, pas un calcul astronomique du soleil.
- Une seule image locale et moins de 60 Ko de code source pour le rendu. Terrain précomposé lors des changements d’ambiance ; maximum de 135 particules et de 1,8 million de pixels de rendu, DPR plafonné à 1,5.
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
