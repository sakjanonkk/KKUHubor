import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve } from "path";

const workbook = XLSX.readFile(
  resolve(__dirname, "../ข้อมูลรายวิชาระดับปริญญาตรีทุกคณะ.xlsx")
);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<{
  รหัสวิชา: string;
  ชื่อวืชาภาษาไทย: string; // typo in Excel header
  ชื่อวิชาภาษาอังกฤษ: string;
  คณะ: string;
}>(sheet);

const courses = rows
  .filter((r) => r.รหัสวิชา && r.ชื่อวืชาภาษาไทย && r.คณะ)
  .map((r) => ({
    code: String(r.รหัสวิชา).trim(),
    nameTH: r.ชื่อวืชาภาษาไทย.trim(),
    nameEN: (r.ชื่อวิชาภาษาอังกฤษ || "").trim(),
    faculty: r.คณะ.trim(),
  }));

// Deduplicate by code (keep first occurrence)
const seen = new Set<string>();
const unique = courses.filter((c) => {
  if (seen.has(c.code)) return false;
  seen.add(c.code);
  return true;
});

const outPath = resolve(__dirname, "courses-data.json");
writeFileSync(outPath, JSON.stringify(unique, null, 2), "utf-8");

console.log(`Total rows: ${rows.length}`);
console.log(`Valid rows: ${courses.length}`);
console.log(`Unique courses: ${unique.length}`);
console.log(`Duplicates removed: ${courses.length - unique.length}`);
console.log(`Output: ${outPath}`);

// Print faculty summary
const facultyCounts: Record<string, number> = {};
for (const c of unique) {
  facultyCounts[c.faculty] = (facultyCounts[c.faculty] || 0) + 1;
}
console.log(`\nFaculties (${Object.keys(facultyCounts).length}):`);
for (const [name, count] of Object.entries(facultyCounts).sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${name}: ${count}`);
}
