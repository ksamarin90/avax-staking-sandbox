import { avm, evm, pvm } from '@avalabs/avalanchejs';
import { config } from 'dotenv';
config();

export const evmapi = new evm.EVMApi(process.env.AVAX_PUBLIC_URL);
export const avmapi = new avm.AVMApi(process.env.AVAX_PUBLIC_URL);
export const pvmapi = new pvm.PVMApi(process.env.AVAX_PUBLIC_URL);
