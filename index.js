#!/usr/bin/env node

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']  // ← add this option
});

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN'];
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ Please provide stock symbols or use --table flag, e.g.:\n  node index.js AAPL MSFT\n  node index.js --table");
  process.exit(1);
}

async function fetchPrices(symbolList, displayMode = 'individual') {
  try {
    const quotes = [];
    for (const sym of symbolList) {
      const quote = await yahooFinance.quote(sym);
      const {
        regularMarketPrice: price,
        currency,
        shortName,
        symbol,
        regularMarketChange,
        regularMarketChangePercent
      } = quote;

      if (displayMode === 'individual') {
        console.log(`\n📈 ${shortName || symbol}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Price: ${price} ${currency}`);
        console.log(`Change: ${regularMarketChange?.toFixed(2)} (${regularMarketChangePercent?.toFixed(2)}%)`);
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        console.log(`Time: ${formattedDate}, ${formattedTime}`);
      } else {
        quotes.push({
          Symbol: symbol,
          Name: shortName || symbol,
          Price: `${price} ${currency}`,
          Change: `${regularMarketChange?.toFixed(2)} (${regularMarketChangePercent?.toFixed(2)}%)`
        });
      }
    }

    if (displayMode === 'table') {
      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      console.log(`\n📊 Market Overview - ${formattedDate}, ${formattedTime}`);
      console.table(quotes);
      console.log("");
    }
  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
    process.exit(1);
  }
}

// Function to clear console and move cursor to top
function clearConsole() {
  console.clear();
  // Add a message about how to exit
  console.log("📊 Live Stock Tracker (Press Ctrl+C to exit)\n");
}

// Check if --table flag is used
if (args.includes('--table')) {
  // Initial fetch
  clearConsole();
  fetchPrices(DEFAULT_SYMBOLS, 'table');
  
  // Refresh every 10 seconds
  setInterval(async () => {
    clearConsole();
    await fetchPrices(DEFAULT_SYMBOLS, 'table');
  }, 10000); // 10000ms = 10 seconds
} else {
  fetchPrices(args, 'individual');
}
