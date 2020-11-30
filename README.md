# SWS Extension

SWS Debugger est une extension VSCode permettant de debugger des systèmes embarqués basés sur des micro-contrôleurs Atmel (ATMega, AVR, ATtiny, ...). L'idée de base de cette extension est d'avoir un seul outil, pour le developpement firmware, intégré à notre éditeur: VSCode.\
Elle permettrait de developper des nouveaux firmwares sans dépendances avec des IDEs au fonctionnement parfois flous. De plus, il est très difficile (voir impossible) d'utiliser Atmel Studio 7 pour une session de debug avec des fichiers sources externes. Enfin il sera plus aisé de migrer vers des nouveaux microcontrôleurs tel que l'avr128da48, l'attiny817 et de figer leurs dépendances (version avr-gcc, version du pack).

## Nouveau makefile

## Paramètres
| Paramètre    | Description                                             |
| :----------- | :------------------------------------------------------ |
| CORE         | Micro-contrôleur cible                                  |
| F_CPU        | Fréquence du CPU en Hz                                  |
| INTERFACE    | Interface de programmation (UPDI, JTAG, ...)            |
| PACK         | Nom du dossier contenant le pack                        |
| PACK_VERSION | Numéro de version du pack atmel                         |
| TARGET       | Projet swing (IR_3D, IR_PORTE, ...)                     |
| TOOL         | Outil de programmation (atmelice, avrdragon, nedbg,...) |


## Commandes de base:
Ces commandes de base sont gérées par le makefile.  


| Commande      | key        | Description                                             |
| :------------ | :--------- | :------------------------------------------------------ |
| make -s all   | ctrl+alt+b | Compile les fichiers source et génère le binaire (.hex) |
| make -s flash | ctrl+alt+f | Flash le microcontrôleur donné en paramètres            |
| make -s clean | ctrl+alt+c | Supprime les objets et binaires dans out                |

  
# SWS Debugger
## Configuration du debugger
```JSON
{
    "type": "sws",
    "request": "launch",
    "name": "Sws Debug",
    "atbackendHost": "127.0.0.1",
    "atbackendPort": 4710,
    "program": "${workspaceFolder}\\debug\\TESTEUR_IR_PORTE_00_01.elf",
    "tool": "atmelice",
    "device": "attiny817",
    "interface": "UPDI",
    "interfaceProperties": {
        "UpdiClock": 2000000,
        "KeepTimersRunning": true
    },
    "launchSuspended": true,
    "launchAttached": true,
    "cacheFlash": true,
    "eraseRule": 0,
    "preserveEeprom": true,
    "progFlashFromRam": true,
    "ramSnippetAddress": "0x20000000",
    "useGdb": true,
    "gdbLocation": "C:\\toolchains\\avr-gcc_5-4\\bin\\avr-gdb.exe",
    "bootSegment": 2,
    "packPath": "C:/toolchains/packs/atmel/ATtiny_DFP/1.7.330/Atmel.ATtiny_DFP.pdsc",
    "noDebug": true
}
```

## Description des paramètres:

| Paramètre           | Description                                                  |
| :------------------ | :----------------------------------------------------------- |
| type                | Type de la session de debug, laisser sws                     |
| request             | Laisser launch pour lancer une session de debug "sws"        |
| name                | Nom de la session affiché dans VSCode                        |
| atbackendHost       | Addresse websocket d'ATBackend                               |
| atbackendPort       | Port d'ATBackend                                             |
| program             | Binaire à debugger (.elf)                                    |
| tool                | Outil de programmation (atmelice, avrdragon, nedbg,...)      |
| device              | Micro-contrôleur (attiny817, avr128da48, atmega644p)         |
| interface           | Interface de programmation (UPDI, JTAG, SWD, ...)            |
| interfaceProperties | Propriétés de l'interface de programmation                   |
| InterfaceClock      | Frequence de l'interface de programmation (Hz),              |
| launchSuspended     | Si vrai arrete l'exécution à l'entrée du main                |
| launchAttached      | TODO                                                         |
| cacheFlash          | TODO                                                         |
| preserveEeprom      | Préserve l'eeprom lorsque vous demarrez une session de debug |
| progFlashFromRam    | TODO                                                         |
| ramSnippetAddress   | TODO                                                         |
| useGdb              | Laisser à True, car debug sans gdb impossible pour le moment |
| gdbLocation         | Chemin vers GDB                                              |
| bootSegment         | Préserve l'eeprom lorsque vous demarrez une session de debug |
| packPath            | Chemin vers le pack atmel (.pdsc) du mico-contrôleur         |
# Release Notes

## 0.0.1
Implémentation des commandes de base de l'extension: compiler, programmer.
### 0.0.2 
Création du "debug adapter" permettant de debugger n'importe quel microcontrôleur Atmel.