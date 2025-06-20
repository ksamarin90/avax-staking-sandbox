import { addTxSignatures, pvm, TransferableOutput, utils } from '@avalabs/avalanchejs';
import { setupEtnaExample } from './etna-helper';
import { getEnvVars } from './getEnvVars';

const AMOUNT_TO_EXPORT_AVAX: number = 0.0067;

async function main() {
	const { AVAX_PUBLIC_URL, PRIVATE_KEY, CORETH_ADDRESS } = getEnvVars();

	const { context, feeState, pvmApi } = await setupEtnaExample(AVAX_PUBLIC_URL);

	const { utxos } = await pvmApi.getUTXOs({
		addresses: [process.env.P_CHAIN_ADDRESS_1!],
	});

	const exportTx = pvm.newExportTx(
		{
			destinationChainId: context.cBlockchainID,
			feeState,
			fromAddressesBytes: [
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_1!),
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_2!),
			],
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
		privateKeys: [
			//
			utils.hexToBuffer(process.env.PRIVATE_KEY_1!),
			utils.hexToBuffer(process.env.PRIVATE_KEY_2!),
		],
	});

	const bridgeTx = await pvmApi.issueSignedTx(exportTx.getSignedTx());
	console.log(bridgeTx.txID);
}

main();
