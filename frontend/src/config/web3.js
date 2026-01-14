import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { polygon } from 'wagmi/chains'

// WalletConnect Project ID - Get yours at https://cloud.walletconnect.com
// Using a demo project ID for development
const projectId = 'c4f79cc821944d9680842e34466bfbd3'

// App metadata for WalletConnect
const metadata = {
  name: 'ZWAP! Coin',
  description: 'Move. Play. Swap. Shop.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://zwap.app',
  icons: ['https://customer-assets.emergentagent.com/job_zwap-wallet/artifacts/8gvtmj56_Zwap_logo_full.png']
}

// Configure chains - Polygon is the primary chain for ZWAP
const chains = [polygon]

// Create wagmi config
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false,
})

// Create Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  defaultChain: polygon,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#00f5ff',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#00f5ff',
    '--w3m-border-radius-master': '12px',
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
})

export { projectId, metadata, chains }
