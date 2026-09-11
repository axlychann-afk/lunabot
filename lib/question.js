import fs from "fs";
import chalk from "chalk";

function ask(question) {
  return new Promise(resolve => {
    process.stdout.write(question);
    
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (data) => {
      process.stdin.off("data", onData);
      process.stdin.pause();
      resolve(data);
    };

    process.stdin.on("data", onData);
  });
}

function toBold(str) {
  const bold = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴",
    h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻",
    o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂",
    v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚",
    H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡",
    O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨",
    V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    "0":"𝟬", "1":"𝟭", "2":"𝟮", "3":"𝟯", "4":"𝟰",
    "5":"𝟱", "6":"𝟲", "7":"𝟳", "8":"𝟴", "9":"𝟵"
  };
  return [...str].map(ch => bold[ch] || ch).join("");
}

export default async function updateSettings() {
  let file = fs.readFileSync("./settings.js", "utf8");

  function getValue(name) {
    const regex = new RegExp(`global\\.${name}\\s*=\\s*["'\`](.*?)["'\`]`);
    const match = file.match(regex);
    return match ? match[1] : null;
  }

  let nomorbot = getValue("nomorbot");
  let ownername = getValue("ownername");
  let ownernumber = getValue("ownernumber");
  let runtime = getValue("runtime");

  async function maybeAsk(label, currentValue, color = "cyan") {
    if (currentValue && currentValue !== "-") return currentValue;

    const q = chalk[color](`\n${toBold(label)} 🍦🍨✨ :\n> `);
    const ans = await ask(q); 
    return ans.trim();
  }

  nomorbot = await maybeAsk("Masukan Nomor bot kamu:", nomorbot, "yellow");
  ownername = await maybeAsk("Masukan nama kamu:", ownername, "magenta");
  ownernumber = await maybeAsk("Masukan Nomor Kamu:", ownernumber, "green");
  runtime = await maybeAsk("Masukan jenis runtime(vps/panel):", runtime, "cyan");

  file = file
    .replace(/global\.nomorbot\s*=\s*["'`](.*?)["'`]/, `global.nomorbot = "${nomorbot}"`)
    .replace(/global\.ownername\s*=\s*["'`](.*?)["'`]/, `global.ownername = "${ownername}"`)
    .replace(/global\.ownernumber\s*=\s*["'`](.*?)["'`]/, `global.ownernumber = "${ownernumber}"`)
    .replace(/global\.runtime\s*=\s*["'`](.*?)["'`]/, `global.runtime = "${runtime}"`);

  fs.writeFileSync("./settings.js", file);

  console.log(chalk.cyanBright("\n✨ Settings successfully updated! ✨\n"));
}
