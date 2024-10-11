import env from './env.json'

const url = env.HTTP_SERVER_URL;




export const startAudit = ({ contract_address, abi }) => {
	const method = 'POST';
	const request_url = `${url}/contract/startAudit`
	const headers = {
		'Content-Type': 'application/json',
	}

	const body = JSON.stringify({ contract_address, abi })

	return fetch(request_url, { method, body, headers })
		.then((res) => res.json());
};


export const stopAudit = ({ contract_address }) => {
	const method = 'POST';
	const request_url = `${url}/contract/startAudit`
	const headers = {
		'Content-Type': 'application/json',
	}

	const body = JSON.stringify({ contract_address })

	return fetch(request_url, { method, body, headers })
		.then((res) => res.json());
};

export const getTransactions = ({ contract_address }) => {
	const method = 'POST';
	const request_url = `${url}/contract/getTxs`
	const headers = {
		'Content-Type': 'application/json',
	}

	const body = JSON.stringify({ contract_address })

	return fetch(request_url, { method, body, headers })
		.then((res) => res.json());
};

export const getNonce = (pk) => {
	const method = 'POST';
	const request_url = `${url}/contract/getNonce`
	const headers = {
		'Content-Type': 'application/json',
	}

	const body = JSON.stringify({ pk })

	return fetch(request_url, { method, body, headers })
		.then((res) => res.json());
};

export const invokeMethod = ({ contract_address, params, abi, pk, maxGas, maxPrioGas, is_flash, value }) => {
	const method = 'POST';
	const request_url = `${url}/contract/invokeMethod`
	const headers = {
		'Content-Type': 'application/json',
	}

	const body = JSON.stringify({ contract_address, params, abi, p: pk, maxGas, maxPrioGas, is_flash, value })

	return fetch(request_url, { method, body, headers })
		.then((res) => res.json());
};