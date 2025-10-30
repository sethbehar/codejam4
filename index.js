#!/usr/bin/env node

import YahooFinance from "yahoo-finance2";
import chalk from "chalk";

const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']
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
        regularMarketChangePercent,
        pe,
        priceToBook,
        profitMargins,
        fiftyTwoWeekLow,
      } = quote;

      

      if (displayMode === 'individual' || displayMode === 'analyst') {

        if (displayMode === 'analyst') 
          analystQuote(symbol, pe, profitMargins, price)
        

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
    console.error("");
    process.exit(1);
  }
}

function analystQuote(symbol, pe, profitMargins, price) {
  console.log("\n" + chalk.blue.bold(`Seth & Matt’s Analyst Quote for ${symbol} (Buy, Sell, Hold)`));

  let message;
  let style;

  if (profitMargins > 40) {
    message = "Matt observes that the profit margins are over 40% → BUY";
    style = chalk.green.bold;
  }
  else if (pe > 20) {
    message = "Seth observes that the P/E is over 40 → BUY";
    style = chalk.green.bold;
  }
  else if (price > 400) {
    message = "Seth and Matt observe that the price is too high, let’s wait for a stock split → HOLD";
    style = chalk.yellow.bold;
  }
  else {
    message = "Seth and Matt don’t see anything special → SELL";
    style = chalk.red.bold;
  }

  console.log(style(message));

}

// Function to clear console and move cursor to top
function clearConsole() {
  console.clear();
  // Add a message about how to exit
  console.log("📊 Live Stock Tracker (Press Ctrl+C to exit)\n");
}



// ---------- MAIN FUNCTION ----------

if (args.includes('--table')) {
  clearConsole();
  fetchPrices(DEFAULT_SYMBOLS, 'table');

  setInterval(async () => {
    clearConsole();
    await fetchPrices(DEFAULT_SYMBOLS, 'table');
  }, 10000); 
}
else if (args.includes('--analyst')) {
    fetchPrices(args, 'analyst');
}
else {
  fetchPrices(args, 'individual');
}
