import { addTxSignatures, pvm, utils } from '@avalabs/avalanchejs';
import { setupEtnaExample } from './etna-helper';
import { getEnvVars } from './getEnvVars';

const main = async () => {
	const { AVAX_PUBLIC_URL, CORETH_ADDRESS } = getEnvVars();

	const { context, feeState, pvmApi } = await setupEtnaExample(AVAX_PUBLIC_URL);

	const { utxos } = await pvmApi.getUTXOs({
		sourceChain: 'C',
		addresses: [
			//
			process.env.P_CHAIN_ADDRESS_1!,
			process.env.P_CHAIN_ADDRESS_2!,
		],
	});

	const importTx = pvm.newImportTx(
		{
			feeState,
			fromAddressesBytes: [utils.bech32ToBytes(CORETH_ADDRESS)],
			sourceChainId: context.cBlockchainID,
			toAddressesBytes: [
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_2!),
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_1!),
			],
			utxos,
		},
		context,
	);

	console.log(importTx);

	await addTxSignatures({
		unsignedTx: importTx,
		privateKeys: [utils.hexToBuffer(process.env.PRIVATE_KEY_1!), utils.hexToBuffer(process.env.PRIVATE_KEY_2!)],
	});

	return pvmApi.issueSignedTx(importTx.getSignedTx());
};

main().then(console.log);
