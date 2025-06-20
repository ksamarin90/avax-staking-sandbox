import { addTxSignatures, networkIDs, pvm, utils } from '@avalabs/avalanchejs';
import { setupEtnaExample } from './etna-helper';
import { getEnvVars } from './getEnvVars';

const AMOUNT_TO_DELEGATE_AVAX: number = 1;
const DAYS_TO_DELEGATE: number = 2;
const nodeId = 'NodeID-G5zau2w7uHkxsCPR1k4KvckXR3NEkWo1t';

const main = async () => {
	const { AVAX_PUBLIC_URL } = getEnvVars();

	const { context, feeState, pvmApi } = await setupEtnaExample(AVAX_PUBLIC_URL);

	const { utxos } = await pvmApi.getUTXOs({
		addresses: [process.env.P_CHAIN_ADDRESS_1!, process.env.P_CHAIN_ADDRESS_2!],
	});

	const startTime = await pvmApi.getTimestamp();
	const startDate = new Date(startTime.timestamp);
	const start: bigint = BigInt(startDate.getTime() / 1_000);

	const endTime = new Date(startTime.timestamp);
	endTime.setDate(endTime.getDate() + DAYS_TO_DELEGATE);
	const end: bigint = BigInt(endTime.getTime() / 1_000);

	const tx = pvm.newAddPermissionlessDelegatorTx(
		{
			end,
			feeState,
			fromAddressesBytes: [
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_1!),
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_2!),
			],
			nodeId,
			rewardAddresses: [
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_1!),
				utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_2!),
			],
			start,
			subnetId: networkIDs.PrimaryNetworkID.toString(),
			utxos,
			weight: BigInt(AMOUNT_TO_DELEGATE_AVAX * 1e9),
		},
		context,
	);

	await addTxSignatures({
		unsignedTx: tx,
		privateKeys: [
			//
			utils.hexToBuffer(process.env.PRIVATE_KEY_1!),
			utils.hexToBuffer(process.env.PRIVATE_KEY_2!),
		],
	});

	return pvmApi.issueSignedTx(tx.getSignedTx());
};

main().then(console.log);
