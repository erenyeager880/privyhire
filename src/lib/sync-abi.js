import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', '..', 'contracts-fhe', 'artifacts', 'contracts');

const getAbi = (contractName) => {
  const filePath = path.join(ARTIFACTS_DIR, `${contractName}.sol`, `${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return artifact.abi;
};

// Addresses from the latest deployment (March 26, 2026)
const PRIVY_HIRE_ADDRESS = '0x24F162aF24C8DDa51e94AAB6F36dC3AFc6882581';
const REPUTATION_VAULT_ADDRESS = '0xA6Fe9509C1eA8a998b697eb166F9743Da064Ac9D';
const REFERRALS_ADDRESS = '0x1F130e12b9236cC290Ed0100a4103927aeeCA693';

const content = `export const PRIVY_HIRE_ADDRESS = '${PRIVY_HIRE_ADDRESS}';
export const REPUTATION_VAULT_ADDRESS = '${REPUTATION_VAULT_ADDRESS}';
export const REFERRALS_ADDRESS = '${REFERRALS_ADDRESS}';

export const PRIVY_HIRE_ABI = ${JSON.stringify(getAbi('PrivyHire'), null, 2)} as const;
export const REPUTATION_VAULT_ABI = ${JSON.stringify(getAbi('PrivyHireReputationVault'), null, 2)} as const;
export const REFERRALS_ABI = ${JSON.stringify(getAbi('PrivyHireReferrals'), null, 2)} as const;
`;

fs.writeFileSync(path.join(__dirname, 'contracts.ts'), content);
console.log('Successfully updated contracts.ts with all ABIs and Addresses.');
