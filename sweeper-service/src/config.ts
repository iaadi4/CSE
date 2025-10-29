import fs from "fs";
import yaml from "yaml";
import path from "path";

export interface Config {
  master_seed: string,
  database_url: string
}

function loadConfig() {
  const configPath = path.join(
    process.cwd(),
    "src",
    "configs",
    "wallet.config.yml"
  );

  try {
    const fileCotents = fs.readFileSync(configPath, "utf-8");
    const config = yaml.parse(fileCotents);

    return config as Config;
  } catch (error) {
    console.error("FATAL: Could not read or parse config.yaml file.");
    console.error("Please ensure configs/configs.yaml exists and is valid.");
    console.error("Error details:", error);

    process.exit(1);
  }
}

export const config = loadConfig();