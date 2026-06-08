import {
  Activity,
  ArrowLeftRight,
  CircleDollarSign,
  Gem,
  Images,
  Landmark,
  Layers3,
  Network,
  Radio,
  ShieldCheck,
  Trophy,
  WalletCards,
} from 'lucide-react'
import calendar3d from '@iconify-icons/fluent-emoji/calendar'
import globe3d from '@iconify-icons/fluent-emoji/globe-with-meridians'
import identificationCard3d from '@iconify-icons/fluent-emoji/identification-card'
import rocket3d from '@iconify-icons/fluent-emoji/rocket'
import shield3d from '@iconify-icons/fluent-emoji/shield'
import trophy3d from '@iconify-icons/fluent-emoji/trophy'

export const navItems = [
  { label: 'Overview', icon: '99_1001.svg' },
  { label: 'Money Flow', icon: '99_1008.svg' },
  { label: 'Portfolio', icon: '99_1015.svg' },
  { label: 'Insights', icon: '99_1022.svg' },
]

export const metricIcons = {
  rank: Trophy,
  activity: Activity,
  risk: ShieldCheck,
  network: Network,
}

export const portfolioIcons = {
  wallet: WalletCards,
  nft: Images,
  defi: Landmark,
  collection: Gem,
}

export const identityIcons = {
  portfolio: trophy3d,
  risk: shield3d,
  age: calendar3d,
  kyc: identificationCard3d,
}

export const aiIcons = {
  network: globe3d,
  risk: shield3d,
  growth: rocket3d,
}

export const highlightIcons = {
  holding: CircleDollarSign,
  protocol: Layers3,
  chain: Radio,
  transactions: ArrowLeftRight,
}
