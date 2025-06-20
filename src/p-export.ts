import { addTxSignatures, pvm, TransferableOutput, utils } from '@avalabs/avalanchejs';
import { setupEtnaExample } from './etna-helper';
import { getEnvVars } from './getEnvVars';

const AMOUNT_TO_EXPORT_AVAX: number = 0.011;

async function main() {
	const { AVAX_PUBLIC_URL, P_CHAIN_ADDRESS, PRIVATE_KEY, C_CHAIN_ADDRESS, CORETH_ADDRESS } = getEnvVars();

	const { context, feeState, pvmApi } = await setupEtnaExample(AVAX_PUBLIC_URL);

	const { utxos } = await pvmApi.getUTXOs({
		addresses: [P_CHAIN_ADDRESS],
	});

	const exportTx = pvm.newExportTx(
		{
			destinationChainId: context.cBlockchainID,
			feeState,
			fromAddressesBytes: [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
			outputs: [
				TransferableOutput.fromNative(context.avaxAssetID, BigInt(AMOUNT_TO_EXPORT_AVAX * 1e9), [
					utils.bech32ToBytes(CORETH_ADDRESS),
				]),
			],
			utxos,
		},
		context,
	);

	await addTxSignatures({
		unsignedTx: exportTx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});

	const bridgeTx = await pvmApi.issueSignedTx(exportTx.getSignedTx());
	console.log(bridgeTx.txID);
}

main();
