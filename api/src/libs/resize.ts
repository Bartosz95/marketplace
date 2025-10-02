import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "./images";
const outputDir = "./resized";

// Recursively collect files from all subdirectories
const getFiles = (dir: string): string[] => {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath)); // go deeper
    } else {
      results.push(filePath);
    }
  });

  return results;
};

const resizeImages = async () => {
  const files = getFiles(inputDir);

  for (const file of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue; // skip non-images

    // preserve relative path of file inside outputDir
    const relativePath = path.relative(inputDir, file);
    const outputPath = path.join(outputDir, relativePath);

    // ensure subdirectory exists in outputDir
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    try {
      await sharp(file)
        .resize({ height: 689, width: 689, fit: "contain" })
        .toFile(outputPath);

      console.log(`✅ Resized: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`, err);
    }
  }
};

resizeImages().then(() => console.log("🎉 All images processed!"));
