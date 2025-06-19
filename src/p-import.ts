import { addTxSignatures, pvm, utils } from '@avalabs/avalanchejs';
import { setupEtnaExample } from './etna-helper';
import { getEnvVars } from './getEnvVars';

const main = async () => {
	const { AVAX_PUBLIC_URL, P_CHAIN_ADDRESS, PRIVATE_KEY, CORETH_ADDRESS } = getEnvVars();

	const { context, feeState, pvmApi } = await setupEtnaExample(AVAX_PUBLIC_URL);

	const { utxos } = await pvmApi.getUTXOs({
		sourceChain: 'P',
		addresses: [P_CHAIN_ADDRESS],
	});

	console.log(utxos);

	const importTx = pvm.newImportTx(
		{
			feeState,
			fromAddressesBytes: [utils.bech32ToBytes(CORETH_ADDRESS)],
			sourceChainId: context.cBlockchainID,
			toAddressesBytes: [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
			utxos,
		},
		context,
	);

	console.log(JSON.stringify(importTx.tx));

	await addTxSignatures({
		unsignedTx: importTx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});

	return pvmApi.issueSignedTx(importTx.getSignedTx());
};

main().then(console.log);
