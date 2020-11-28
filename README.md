# Configame TV

C'est une application qui permet de voir en direct ou en replay le [configame](http://configame.h25.io/).
Vous pouvez aller voir les créateurs du jeu sur:
+ leur [site](https://blog.h25.io/about/)
+ leur [chaîne twitch](https://www.twitch.tv/h25io)
+ ou encore leur [serveur discord](https://discord.h25.io)

## Installation

Après avoir cloné le repo:

```bash
npm install
```

## Misc
Vous pouvez aussi jouer en cliquant sur la carte !
Pour cela il faut créer le fichier `window/secret.js` et y mettre votre token et votre id discord.
Le fichier `window/dummy_secret.js` est un exemple.

Vous pouvez obtenir votre token en envoyant un msg à @ConfiBot sur [discord](https://discord.h25.io)

et une fois que vous êtes sur la map vous pouvez trouver votre id discord avec:
```bash
curl http://configame.h25.io/getPreviousTick 2> /dev/null  | jq -r 'to_entries[] | select(.value.username == "USERNAME") | .key'
```



