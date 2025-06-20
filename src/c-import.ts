import { addTxSignatures, Context, evm, utils } from '@avalabs/avalanchejs';
import { evmapi } from './chain_apis';
import { getEnvVars } from './getEnvVars';

const main = async () => {
	const sourceChain = 'P';
	const { AVAX_PUBLIC_URL, C_CHAIN_ADDRESS, PRIVATE_KEY, CORETH_ADDRESS } = getEnvVars();

	// const baseFee = await evmapi.getBaseFee();
	const context = await Context.getContextFromURI(AVAX_PUBLIC_URL);

	const { utxos } = await evmapi.getUTXOs({
		sourceChain,
		addresses: [CORETH_ADDRESS],
	});

	const tx = evm.newImportTxFromBaseFee(
		context,
		utils.hexToBuffer(C_CHAIN_ADDRESS),
		[utils.bech32ToBytes(CORETH_ADDRESS)],
		utxos,
		context.pBlockchainID,
		1n,
	);

	await addTxSignatures({
		unsignedTx: tx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});

	return evmapi.issueSignedTx(tx.getSignedTx());
};

main().then(console.log);
