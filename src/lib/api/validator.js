const request = async (method, params) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_VALIDATOR_API_URL}/${method}`, { method: 'POST', body: JSON.stringify(params) }).catch(error => { return null })
  return response && await response.json()
}

export const rpc = async params => await request('rpc', params)
export const getRPCStatus = async params => await request('rpc', { ...params, path: '/status' })
export const lcd = async params => await request('lcd', params)
export const getBlock = async height => await request('lcd', { path: `/cosmos/base/tendermint/v1beta1/blocks/${height}` })
export const getValidatorSets = async (height = 'latest') => await request('lcd', { path: `/validatorsets/${height}` })
export const getTransaction = async txhash => await request('lcd', { path: `/cosmos/tx/v1beta1/txs/${txhash}` })
export const searchBlocks = async params => await request('searchBlocks', params)
export const searchTransactions = async params => await request('searchTransactions', params)
export const getTransactions = async params => await request('getTransactions', params)
export const getValidators = async params => await request('getValidators', params)
export const getValidatorsVotes = async params => await request('getValidatorsVotes', params)
export const searchUptimes = async params => await request('searchUptimes', params)
export const searchProposedBlocks = async params => await request('searchProposedBlocks', params)
export const searchHeartbeats = async params => await request('searchHeartbeats', params)
export const searchPolls = async params => await request('searchPolls', params)
export const searchVMPolls = async params => await request('searchVMPolls', params)
export const getChainMaintainers = async params => await request('getChainMaintainers', params)
export const getValidatorDelegations = async params => await request('getValidatorDelegations', params)
export const getVerifiers = async params => await request('getVerifiers', params)
export const getVerifiersVotes = async params => await request('getVerifiersVotes', params)
