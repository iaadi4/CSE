/**
 * FAQ Section Data
 * Contains all frequently asked questions and their answers
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is the Creator Stock Exchange?",
    answer:
      "The Creator Stock Exchange is a revolutionary platform that allows fans to invest in their favorite creators through unique tokens. Creators launch their tokens via ICO, and fans can buy, trade, and hold these tokens as the creator's influence grows.",
  },
  {
    question: "How do I get started as a fan?",
    answer:
      "Simply create an account, verify your identity with 2FA, deposit cryptocurrency (like USDC) into your universal balance, and start buying tokens from your favorite creators during their ICO or in the secondary marketplace.",
  },
  {
    question: "How do creators launch their tokens?",
    answer:
      "Creators register and submit a detailed profile including their bio, social media links, and brand pitch. Once approved by our platform, they can launch their unique token through an Initial Coin Offering (ICO) by setting the token supply and price.",
  },
  {
    question: "What cryptocurrency can I use?",
    answer:
      "We support major cryptocurrencies like USDC for deposits and transactions. You can deposit funds from any external blockchain wallet, and they'll be credited to your universal balance after confirmation.",
  },
  {
    question: "How does trading work?",
    answer:
      "Fans can trade creator tokens in our dynamic marketplace. Buy low and sell high based on market trends and creator popularity. Our Rust-powered trading engine delivers lightning-fast sub-100ms transaction speeds.",
  },
  {
    question: "Can I withdraw my earnings?",
    answer:
      "Yes! Both fans and creators can withdraw their earnings or unused funds to any external blockchain wallet through a secure, straightforward process with confirmation once the transfer is complete.",
  },
  {
    question: "Is the platform secure?",
    answer:
      "Absolutely. We use 2FA (two-factor authentication) for all accounts, operate on a transparent blockchain, and implement industry-standard security measures to protect your assets and data.",
  },
  {
    question: "What benefits do token holders get?",
    answer:
      "Token holders can benefit from the increasing value of a creator's token as their influence grows. Creators may also offer exclusive perks like VIP events, merchandise, special content, or other rewards to their token holders.",
  },
];
