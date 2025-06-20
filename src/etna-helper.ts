import { Context, info, pvm } from '@avalabs/avalanchejs';

export const setupEtnaExample = async (
	uri: string,
): Promise<{
	context: Context.Context;
	feeState: pvm.FeeState;
	pvmApi: pvm.PVMApi;
}> => {
	const context = await Context.getContextFromURI(uri);
	const pvmApi = new pvm.PVMApi(uri);
	const feeState = await pvmApi.getFeeState();

	const infoApi = new info.InfoApi(uri);

	const { etnaTime } = await infoApi.getUpgradesInfo();

	const etnaDateTime = new Date(etnaTime);
	const now = new Date();

	if (etnaDateTime >= now) {
		throw new Error(`Etna upgrade is not enabled. Upgrade time: ${etnaDateTime}`);
	}

	return {
		context,
		feeState,
		pvmApi,
	};
};
