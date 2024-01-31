'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import _ from 'lodash'

import { Container } from '@/components/Container'
import { Tooltip } from '@/components/Tooltip'
import { Spinner } from '@/components/Spinner'
import { Number } from '@/components/Number'
import { Summary } from '@/components/Interchain'
import { NetworkGraph } from '@/components/NetworkGraph'
import { useGlobalStore } from '@/app/providers'
import { getRPCStatus } from '@/lib/api/validator'
import { GMPStats, GMPTotalVolume } from '@/lib/api/gmp'
import { transfersStats, transfersTotalVolume } from '@/lib/api/token-transfer'
import { getChainData } from '@/lib/config'
import { toArray } from '@/lib/parser'
import { toNumber, formatUnits } from '@/lib/number'

function Metrics() {
  const [blockData, setBlockData] = useState(null)
  const { validators, inflationData, networkParameters } = useGlobalStore()

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus({ avg_block_time: true }))
    getData()
    const interval = setInterval(() => getData(), 6 * 1000)
    return () => clearInterval(interval)
  }, [setBlockData])

  return blockData && (
    <div className="w-full overflow-x-auto border border-zinc-100 dark:border-zinc-800 lg:inline-table">
      <div className="mx-auto w-full max-w-7xl flex items-center gap-x-4 px-4 py-3">
        {blockData.latest_block_height && (
          <div className="h-6 flex items-center gap-x-1.5">
            <div className="text-zinc-400 dark:text-zinc-300 text-xs whitespace-nowrap">Latest Block:</div>
            <Link
              href={`/block/${blockData.latest_block_height}`}
              target="_blank"
              className="flex items-center text-blue-600 dark:text-blue-500"
            >
              <Number value={blockData.latest_block_height} className="text-xs font-medium" />
            </Link>
            {blockData.avg_block_time && (
              <Number
                value={blockData.avg_block_time}
                format="0,0.00"
                prefix="("
                suffix="s)"
                className="text-zinc-400 dark:text-zinc-300 text-xs"
              />
            )}
          </div>
        )}
        {validators && (
          <>
            <span className="text-zinc-200 dark:text-zinc-700">|</span>
            <div className="flex items-center gap-x-2.5">
              <div className="h-6 flex items-center gap-x-1.5">
                <div className="text-zinc-400 dark:text-zinc-300 text-xs">Validators:</div>
                <Link
                  href="/validators"
                  target="_blank"
                  className="flex items-center text-blue-600 dark:text-blue-500"
                >
                  <Number value={validators.filter(d => d.status === 'BOND_STATUS_BONDED').length} className="text-xs font-medium" />
                </Link>
              </div>
              <div className="h-6 flex items-center gap-x-1.5">
                <div className="text-zinc-400 dark:text-zinc-300 text-xs">Threshold:</div>
                <Link
                  href="/validators"
                  target="_blank"
                  className="flex items-center text-blue-600 dark:text-blue-500"
                >
                  <div className="hidden lg:block">
                    <Tooltip content="Threshold number of quadratic voting power required to onboard a new EVM chain" className="whitespace-nowrap">
                      <Number
                        value={60}
                        prefix=">"
                        suffix="%"
                        className="text-xs font-medium"
                      />
                    </Tooltip>
                  </div>
                  <div className="block lg:hidden">
                    <div className="flex items-center">
                      <Number
                        value={60}
                        prefix=">"
                        suffix="%"
                        className="text-xs font-medium"
                      />
                    </div>
                  </div>
                </Link>
              </div>
              <div className="h-6 flex items-center gap-x-1.5">
                <div className="text-zinc-400 dark:text-zinc-300 text-xs">Rewards:</div>
                <Link
                  href="https://axelar.network/blog/axelar-governance-explained"
                  target="_blank"
                  className="flex items-center text-blue-600 dark:text-blue-500"
                >
                  <div className="hidden lg:block">
                    <Tooltip content="Additional chain rewards" className="whitespace-nowrap">
                      <Number
                        value={0.3}
                        suffix="% / EVM chain"
                        className="text-xs font-medium"
                      />
                    </Tooltip>
                  </div>
                  <div className="block lg:hidden">
                    <div className="flex items-center">
                      <Number
                        value={0.3}
                        suffix="% / EVM chain"
                        className="text-xs font-medium"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <span className="text-zinc-200 dark:text-zinc-700">|</span>
          </>
        )}
        {networkParameters?.bankSupply?.amount && networkParameters.stakingPool?.bonded_tokens && (
          <div className="h-6 flex items-center gap-x-1.5">
            <div className="text-zinc-400 dark:text-zinc-300 text-xs">Staked:</div>
            <Link
              href="/validators"
              target="_blank"
              className="flex items-center text-blue-600 dark:text-blue-500"
            >
              <Number
                value={formatUnits(networkParameters.stakingPool.bonded_tokens, 6)}
                format="0,0a"
                noTooltip={true}
                className="text-xs font-medium"
              />
              <Number
                value={formatUnits(networkParameters.bankSupply.amount, 6)}
                format="0,0.00a"
                prefix="/ "
                noTooltip={true}
                className="text-xs font-medium ml-1"
              />
            </Link>
          </div>
        )}
        {inflationData?.inflation > 0 && (
          <>
            {networkParameters?.bankSupply?.amount && networkParameters.stakingPool?.bonded_tokens && (
              <div className="h-6 flex items-center gap-x-1.5">
                <div className="text-zinc-400 dark:text-zinc-300 text-xs">APR:</div>
                <Link
                  href="https://wallet.keplr.app/chains/axelar"
                  target="_blank"
                  className="flex items-center text-blue-600 dark:text-blue-500"
                >
                  <Number
                    value={inflationData.inflation * 100 * formatUnits(networkParameters.bankSupply.amount, 6) * (1 - inflationData.communityTax) * (1 - 0.05) / formatUnits(networkParameters.stakingPool.bonded_tokens, 6)}
                    format="0,0.00"
                    suffix="%"
                    noTooltip={true}
                    className="text-xs font-medium"
                  />
                </Link>
              </div>
            )}
            <div className="h-6 flex items-center gap-x-1.5">
              <div className="text-zinc-400 dark:text-zinc-300 text-xs">Inflation:</div>
              <Link
                href="/validators"
                target="_blank"
                className="flex items-center text-blue-600 dark:text-blue-500"
              >
                <Number
                  value={inflationData.inflation * 100}
                  format="0,0.00"
                  suffix="%"
                  noTooltip={true}
                  className="text-xs font-medium"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function Overview() {
  const [data, setData] = useState(null)
  const { chains } = useGlobalStore()

  useEffect(() => {
    const metrics = ['GMPStats', 'GMPTotalVolume', 'transfersStats', 'transfersTotalVolume']

    const getData = async () => {
      if (chains) {
        const data = Object.fromEntries(await Promise.all(toArray(metrics.map(d => new Promise(async resolve => {
          switch (d) {
            case 'GMPStats':
              resolve([d, { ...await GMPStats() }])
              break
            case 'GMPTotalVolume':
              resolve([d, toNumber(await GMPTotalVolume())])
              break
            case 'transfersStats':
              resolve([d, { ...await transfersStats() }])
              break
            case 'transfersTotalVolume':
              resolve([d, toNumber(await transfersTotalVolume())])
              break
            default:
              resolve()
              break
          }
        })))))

        data.networkGraph = _.orderBy(Object.entries(_.groupBy(_.concat(
          toArray(data.GMPStats?.messages).flatMap(m => toArray(m.sourceChains || m.source_chains).flatMap(s => toArray(s.destinationChains || s.destination_chains).map(d => {
            const sourceChain = getChainData(s.key, chains)?.id || s.key
            const destinationChain = getChainData(d.key, chains)?.id || d.key
            return { id: toArray([sourceChain, destinationChain]).join('_'), sourceChain, destinationChain, num_txs: d.num_txs, volume: d.volume }
          }))),
          toArray(data.transfersStats?.data).map(d => {
            const sourceChain = getChainData(d.source_chain, chains)?.id || d.source_chain
            const destinationChain = getChainData(d.destination_chain, chains)?.id || d.destination_chain
            return { id: toArray([sourceChain, destinationChain]).join('_'), sourceChain, destinationChain, num_txs: d.num_txs, volume: d.volume }
          }),
        ).filter(d => d.sourceChain && d.destinationChain), 'id')).map(([k, v]) => ({ ..._.head(v), id: k, num_txs: _.sumBy(v, 'num_txs'), volume: _.sumBy(v, 'volume') })), ['num_txs'], ['desc'])

        setData(data)
      }
    }

    getData()
    const interval = setInterval(() => getData(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [chains, setData])

  return (
    <>
      <Metrics />
      <Container className="mt-8">
        {!data ? <Spinner /> :
          <div className="flex flex-col gap-y-8">
            <div className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold">Cross-Chain Activities</h2>
              <Summary data={data} />
            </div>
            <div className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold">Network Graph</h2>
              {typeof window !== 'undefined' && <NetworkGraph data={data.networkGraph} />}
            </div>
          </div>
        }
      </Container>
    </>
  )
}
