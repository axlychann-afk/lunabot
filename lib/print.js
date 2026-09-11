import "../settings.js";

export default async (ramUsage, diskUsage, diskFree, nameBot, verBot, verNodejs, npmVersion, totalPlugins, bailName, verBail, chalk) => {
    const w = chalk.white;
    const g = chalk.gray;
    const r = chalk.red;
    const gn = chalk.green;
    const cy = chalk.cyan;

    if (global.runtime === "vps") {
        console.log(`
${g("┌──────────────────────────────────────────────────────────┐")}
${g("│")}  ${w.bold("SYSTEM BOOT:")} ${cy("HARUKA SYSTEM")} ${g("v" + verBot)}             
${g("└──────────────────────────────────────────────────────────┘")}
${w("                                         _.oo.    │")} ${r("System info:")}
${w("                 _.u[[/;:,-.         .odMMMMMM'   │")} ${r("Name:")} ${gn(nameBot)}
${w("              .o888UU[[[/;:--.  .o@P^    MMM^     │")} ${r("Version:")} ${gn(verBot)}
${w("             oN88888UU[[[/;::---.        dP^      │")} ${r("Plugins:")} ${gn(totalPlugins)}
${w("            dNMMNN888UU[[[/;:----.   .o@P^        │")} 
${w("           ,MMMMMMN888UU[[/;::--. o@^             │")} ${r("Baileys:")}
${w("           NNMMMNN888UU[[[/~.o@@P^-.              │")} ${r("Name:")} ${gn(bailName)}
${w("           888888888UU[[[/o@@^----..              │")} ${r("Version:")} ${gn(verBail)}
${w("          oI8888UU[[[/o@@P^:-----..               │")} 
${w("       .@^  YUU[[[/o@@^;::------..                │")} ${r("Server:")}
${w("     oMP     ^/o@@P^;:::------..                  │")} ${r("Disk:")} ${gn(diskUsage)} / ${gn(diskFree)}
${w("  .dMMM    .o@@^ ^;::-----...                     │")} ${r("Node:")} ${gn(verNodejs)}
${w(" dMMMMMMM@^'       '^^^^^^^                       │")} ${r("RAM :")} ${gn(ramUsage)}
${w("YMMMUP^                                           │")}
${w(" ^^                                               │")}
`)
        await global.sleep(3000);
    } else if (global.runtime === "pterodactyl" || global.runtime === "panel") {
        console.log(`
${g(">>")} ${w.bold("INITIALIZING HARUKA SYSTEM")} ${g("...")}
${w(`
                                         _.oo.
                 _.u[[/;:,-.         .odMMMMMM'
              .o888UU[[[/;:--.  .o@P^    MMM^
             oN88888UU[[[/;::---.        dP^
            dNMMNN888UU[[[/;:----.   .o@P^
           ,MMMMMMN888UU[[/;::--. o@^
           NNMMMNN888UU[[[/~.o@@P^-.
           888888888UU[[[/o@@^----..
          oI8888UU[[[/o@@P^:-----..
       .@^  YUU[[[/o@@^;::------..
     oMP     ^/o@@P^;:::------..
  .dMMM    .o@@^ ^;::-----...
 dMMMMMMM@^'       '^^^^^^^
YMMMUP^
 ^^
`)}
${g("┌───────────────────────────────────────┐")}
${g("│")} ${r("SYSTEM:")} ${gn(nameBot)} (${verBot})
${g("│")} ${r("PLUGINS:")} ${gn(totalPlugins)}
${g("├───────────────────────────────────────┤")}
${g("│")} ${r("BAILEYS:")} ${gn(bailName)} (${verBail})
${g("├───────────────────────────────────────┤")}
${g("│")} ${r("STORAGE:")} ${gn(diskUsage)} / ${gn(diskFree)}
${g("│")} ${r("RUNTIME:")} ${gn(verNodejs)} | ${gn(ramUsage)}
${g("└───────────────────────────────────────┘")}
    `)
        await global.sleep(3000);
    }
}
