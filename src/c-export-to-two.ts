import { addTxSignatures, Context, evm, utils } from '@avalabs/avalanchejs';
import { ethers, JsonRpcProvider } from 'ethers';
import { evmapi } from './chain_apis';
import { getEnvVars } from './getEnvVars';

const main = async () => {
	const { AVAX_PUBLIC_URL, C_CHAIN_ADDRESS, PRIVATE_KEY, P_CHAIN_ADDRESS } = getEnvVars();

	const provider = new JsonRpcProvider(AVAX_PUBLIC_URL + '/ext/bc/C/rpc');
	const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

	await provider.getBalance(signer.address).then(console.log);

	const context = await Context.getContextFromURI(AVAX_PUBLIC_URL);
	const txCount = await provider.getTransactionCount(C_CHAIN_ADDRESS);

	const tx = evm.newExportTxFromBaseFee(
		context,
		1n,
		BigInt(0.007 * 1e9),
		context.pBlockchainID,
		utils.hexToBuffer(C_CHAIN_ADDRESS),
		[utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_1!), utils.bech32ToBytes(process.env.P_CHAIN_ADDRESS_2!)],
		BigInt(txCount),
		undefined,
		{ threshold: 2 },
	);

	await addTxSignatures({
		unsignedTx: tx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});

	const bridgeTx = await evmapi.issueSignedTx(tx.getSignedTx());
	console.log(bridgeTx.txID);
};

main();
