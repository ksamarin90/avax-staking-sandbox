import { addTxSignatures, Context, evm, utils } from '@avalabs/avalanchejs';
import { ethers, JsonRpcProvider } from 'ethers';
import { evmapi } from './chain_apis';
import { getEnvVars } from './getEnvVars';

const main = async () => {
	const { AVAX_PUBLIC_URL, C_CHAIN_ADDRESS, PRIVATE_KEY, P_CHAIN_ADDRESS } = getEnvVars();

	console.log('User address: ', C_CHAIN_ADDRESS);

	const provider = new JsonRpcProvider(AVAX_PUBLIC_URL + '/ext/bc/C/rpc');
	const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

	const balance = await provider.getBalance(signer.address);
	console.log('Balance on C Chain: ', ethers.formatEther(balance));

	const context = await Context.getContextFromURI(AVAX_PUBLIC_URL);
	const txCount = await provider.getTransactionCount(C_CHAIN_ADDRESS);
	const baseFee = await evmapi.getBaseFee();
	const pAddressBytes = utils.bech32ToBytes(P_CHAIN_ADDRESS);

	const baseFeeForP = baseFee / BigInt(1e9);

	console.log('Base Fee on C chain: ', ethers.formatEther(baseFee));
	console.log('Base Fee converted to P Chain: ', ethers.formatUnits(baseFeeForP, 9));

	const amount = BigInt(0.1 * 1e9);
	console.log('Amount to bridge to P Chain: ', ethers.formatUnits(amount, 9));

	const tx = evm.newExportTxFromBaseFee(
		context,
		baseFeeForP,
		amount,
		context.pBlockchainID,
		utils.hexToBuffer(C_CHAIN_ADDRESS),
		[pAddressBytes],
		BigInt(txCount),
	);

	await addTxSignatures({
		unsignedTx: tx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});

	try {
		const bridgeTx = await evmapi.issueSignedTx(tx.getSignedTx());
		console.log(bridgeTx.txID);
	} catch (error) {
		console.log(error);
	}
};

main();
