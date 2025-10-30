#!/usr/bin/env node

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']  // ← add this option
});

const symbols = process.argv.slice(2);
if (symbols.length === 0) {
  console.error("❌ Please provide at least one stock symbol, e.g. `node index.js AAPL MSFT`");
  process.exit(1);
}

async function fetchPrices(symbolList) {
  try {
    for (const sym of symbolList) {
      const quote = await yahooFinance.quote(sym);
      const {
        regularMarketPrice: price,
        currency,
        shortName,
        symbol,
        regularMarketChange,
        regularMarketChangePercent,
        regularMarketTime
      } = quote;

      console.log(`\n📈 ${shortName || symbol}`);
      console.log(`Symbol: ${symbol}`);
      console.log(`Price: ${price} ${currency}`);
      console.log(`Change: ${regularMarketChange?.toFixed(2)} (${regularMarketChangePercent?.toFixed(2)}%)`);
      console.log(`Time: ${new Date(regularMarketTime * 1000).toLocaleString()}`);
    }
    console.log("");
  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
    process.exit(1);
  }
}

fetchPrices(symbols);
