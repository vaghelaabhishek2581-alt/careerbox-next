import fs from "fs";
import path from "path";
import csv from "csv-parser";

function csvToNestedJson(filePath) {
    return new Promise((resolve, reject) => {
        const result = {};

        fs.createReadStream(filePath)
            .pipe(
                csv({
                    skipLines: 2,
                    headers: [
                        "SlNo",
                        "CityTown",
                        "UrbanStatus",
                        "StateCode",
                        "State",
                        "DistrictCode",
                        "District",
                    ],
                })
            )
            .on("data", (row) => {
                const state = row.State?.trim();
                const districtAsCity = row.District?.trim();

                if (state && districtAsCity) {
                    if (!result[state]) result[state] = [];
                    if (!result[state].includes(districtAsCity)) {
                        result[state].push(districtAsCity);
                    }
                }
            })
            .on("end", () => {
                resolve(result);
            })
            .on("error", (err) => reject(err));
    });
}

// ---- Usage ----
const csvFilePath = path.join(process.cwd(), "scripts", "Cities_Towns_District_State_India.csv");
const outputPath = path.join(process.cwd(), "scripts", "states.json");

csvToNestedJson(csvFilePath).then((jsonData) => {
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), "utf-8");
    console.log(`✅ JSON file created at: ${outputPath}`);
});
