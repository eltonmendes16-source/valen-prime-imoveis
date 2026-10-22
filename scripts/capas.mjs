// Lista fotos de capa (public/empreendimentos/<id>/capa.jpg) e páginas de book (public/empreendimentos/<id>/book/*.jpg). Roda antes do dev/build.
import fs from "node:fs";
const base = "public/empreendimentos";
const dirs = fs.existsSync(base) ? fs.readdirSync(base).filter((d) => fs.statSync(`${base}/${d}`).isDirectory()) : [];
const capas = dirs.filter((d) => fs.existsSync(`${base}/${d}/capa.jpg`));
const books = {};
for (const d of dirs) {
  const b = `${base}/${d}/book`;
  if (fs.existsSync(b)) {
    const pgs = fs.readdirSync(b).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
    if (pgs.length) books[d] = pgs;
  }
}
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/capas.json", JSON.stringify(capas));
fs.writeFileSync("src/data/books.json", JSON.stringify(books));
console.log("capas:", capas.length, "| books:", Object.keys(books).length);
