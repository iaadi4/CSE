/**
 * Features Section Data
 * 
 * Contains all feature cards configuration for the bento grid layout.
 * Each feature includes title, description, image, and grid positioning.
 */

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  gridClass: string;
  imageSize: string;
  layout?: "vertical" | "horizontal" | "image-first";
}

export const FEATURES_DATA: FeatureCard[] = [
  {
    id: "fan-driven-growth",
    title: "Fan-Driven Growth",
    description: "Powered by Rust, our trading engine delivers sub-100ms transaction speeds.",
    image: "/images/features/fan-driven-growth.png",
    imageAlt: "Fan-driven growth illustration",
    gridClass: "row-span-3 lg:col-span-4 lg:row-span-2",
    imageSize: "h-[250px] md:h-[350px] lg:h-[400px]",
    layout: "horizontal",
  },
  {
    id: "lightning-fast-trading",
    title: "Lightning-Fast Trading Engine",
    description: "Powered by Rust, our trading engine delivers sub-100ms transaction speeds.",
    image: "/images/features/fast-trading.png",
    imageAlt: "High-speed trading illustration",
    gridClass: "row-span-2 lg:col-span-2 lg:row-span-2",
    imageSize: "h-[150px] md:h-[150px]",
    layout: "vertical",
  },
  {
    id: "global-marketplace",
    title: "Global Creator Marketplace",
    description: "Connect with a worldwide community to invest in or grow your creative empire.",
    image: "/images/features/community.png",
    imageAlt: "Global community marketplace",
    gridClass: "row-span-3 lg:col-span-2 lg:row-span-3",
    imageSize: "h-[250px] md:h-[300px] lg:h-[350px]",
    layout: "image-first",
  },
  {
    id: "secure-blockchain",
    title: "Secure Blockchain Platform",
    description: "Trade and create with confidence on a 2FA-protected, transparent blockchain.",
    image: "/images/features/security.png",
    imageAlt: "Blockchain security illustration",
    gridClass: "row-span-2 lg:col-span-2 lg:row-span-2",
    imageSize: "h-[150px] md:h-[150px]",
    layout: "vertical",
  },
  {
    id: "real-time-trading",
    title: "Real-Time Token Trading",
    description: "Build wealth by trading creator tokens as their influence skyrockets.",
    image: "/images/features/coins-person.png",
    imageAlt: "Real-time token trading",
    gridClass: "row-span-3 lg:col-span-2 lg:row-span-4",
    imageSize: "h-[350px] md:h-[450px] lg:h-[500px]",
    layout: "vertical",
  },
  {
    id: "instant-funding",
    title: "Instant funding for creators as they launch their tokens",
    description: "",
    image: "/images/features/funding.png",
    imageAlt: "Instant creator funding",
    gridClass: "row-span-2 lg:col-span-2 lg:row-span-2",
    imageSize: "h-[200px] md:h-[180px] lg:h-[220px]",
    layout: "image-first",
  },
  {
    id: "wallet-integration",
    title: "Seamless Wallet Integration",
    description: "",
    image: "/images/features/wallet.png",
    imageAlt: "Wallet integration",
    gridClass: "row-span-1 lg:col-span-2 lg:row-span-1",
    imageSize: "h-[120px] md:h-[150px] lg:h-[200px]",
    layout: "horizontal",
  },
];

/**
 * Features section configuration
 */
export const FEATURES_CONFIG = {
  SECTION_TITLE: "Next-Gen Creator Economy: Unleash the Future",
  GRID_ROWS: 6,
  GRID_COLS: 6,
  ROW_HEIGHT: 180, // in pixels
} as const;
