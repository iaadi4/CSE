import fs from "fs";
import yaml from "yaml";
import path from "path";

export interface Config {
  database_url: string,
  node: {
    rpc_url_eth: string;
    rpc_url_sol: string;
  };
  chain_to_index: 'ethereum' | 'solana';
}

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'configs', 'config.yaml');

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.parse(fileContents);
    
    return config as Config;
  } catch (error) {
    console.error('FATAL: Could not read or parse config.yaml file.');
    console.error('Please ensure configs/config.yaml exists and is valid.');
    console.error('Error details:', error);
    
    process.exit(1);
  }
}

export const config = loadConfig();