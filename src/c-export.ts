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
	const baseFee = await evmapi.getBaseFee();
	const pAddressBytes = utils.bech32ToBytes(P_CHAIN_ADDRESS);

	const tx = evm.newExportTxFromBaseFee(
		context,
		baseFee / BigInt(1e9),
		BigInt(0.1 * 1e9),
		context.pBlockchainID,
		utils.hexToBuffer(C_CHAIN_ADDRESS),
		[pAddressBytes],
		BigInt(txCount),
	);

	console.log('Signing....');
	await addTxSignatures({
		unsignedTx: tx,
		privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
	});
	console.log('Signed');

	const bridgeTx = await evmapi.issueSignedTx(tx.getSignedTx());
	console.log(bridgeTx.txID);
};

main();
