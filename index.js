#!/usr/bin/env node

import YahooFinance from "yahoo-finance2";
import chalk from "chalk";

// Note: yahoo-finance2 recommends Node >= 22. If you're on Node 20, it may still work,
// but you might see warnings or occasional weirdness.
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN"];
const rawArgs = process.argv.slice(2);

// Require at least one arg (a symbol or a flag)
if (rawArgs.length === 0) {
  console.error(
    "❌ Please provide stock symbols or use --table flag, e.g.:\n  node index.js AAPL MSFT\n  node index.js --table"
  );
  process.exit(1);
}

// Extract flags and symbols separately
const FLAGS = new Set(rawArgs.filter((a) => a.startsWith("--")));
const symbols = rawArgs.filter((a) => !a.startsWith("--"));

function isNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

async function fetchPrices(symbolList, displayMode = "individual") {
  const quotesForTable = [];

  for (const sym of symbolList) {
    try {
      const quote = await yahooFinance.quote(sym);

      if (!quote) {
        throw new Error(`No quote returned for ${sym}`);
      }

      const {
        regularMarketPrice: price,
        currency,
        shortName,
        symbol,
        regularMarketChange,
        regularMarketChangePercent,
        trailingPE: pe,
        fiftyDayAverage,
      } = quote;

      if (displayMode === "individual" || displayMode === "analyst") {
        if (displayMode === "analyst") {
          analystQuote(symbol, pe, fiftyDayAverage, price);
        }

        console.log(`\n📈 ${shortName || symbol}`);
        console.log(`Symbol: ${symbol}`);
        console.log(`Price: ${price} ${currency}`);

        const ch = isNumber(regularMarketChange)
          ? regularMarketChange.toFixed(2)
          : "—";
        const chPct = isNumber(regularMarketChangePercent)
          ? regularMarketChangePercent.toFixed(2)
          : "—";

        console.log(`Change: ${ch} (${chPct}%)`);

        const date = new Date();
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        console.log(`Time: ${formattedDate}, ${formattedTime}`);
      } else {
        // table mode
        const ch = isNumber(regularMarketChange)
          ? regularMarketChange.toFixed(2)
          : "—";
        const chPct = isNumber(regularMarketChangePercent)
          ? regularMarketChangePercent.toFixed(2)
          : "—";

        quotesForTable.push({
          Symbol: symbol,
          Name: shortName || symbol,
          Price: `${price} ${currency}`,
          Change: `${ch} (${chPct}%)`,
        });
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${sym}:`, error?.message || error);
    }
  }

  if (displayMode === "table") {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    console.log(`\n📊 Market Overview - ${formattedDate}, ${formattedTime}`);
    console.table(quotesForTable);
    console.log("");
  }
}

function analystQuote(symbol, pe, fiftyDayAverage, price) {
  console.log(
    "\n" + chalk.blue.bold(`Seth & Matt’s Analyst Quote for ${symbol} (Buy, Sell, Hold)`)
  );

  let message;
  let style;

  if (fiftyDayAverage > price * 1.1) {
    message = "Matt observes that the fifty-day average is too low → BUY";
    style = chalk.green.bold;
  } else if (pe > 40) {
    message = "Seth observes that the P/E is solid → BUY";
    style = chalk.green.bold;
  } else if (price > 400) {
    message =
      "Seth and Matt observe that the price is too high, lets' wait → HOLD";
    style = chalk.yellow.bold;
  } else {
    message = "Seth and Matt don’t see anything special → SELL";
    style = chalk.red.bold;
  }

  console.log(style(message));
}

function clearConsole() {
  console.clear();
  console.log("📊 Live Stock Tracker (Press Ctrl+C to exit)\n");
}

// ---------- MAIN FUNCTION ----------
(async function main() {
  try {
    if (FLAGS.has("--table")) {
      const list = symbols.length ? symbols : DEFAULT_SYMBOLS;
      clearConsole();
      await fetchPrices(list, "table");

      setInterval(async () => {
        clearConsole();
        await fetchPrices(list, "table");
      }, 10000);
    } else if (FLAGS.has("--analyst")) {
      const list = symbols.length ? symbols : DEFAULT_SYMBOLS;
      await fetchPrices(list, "analyst");
    } else {
      const list = symbols.length ? symbols : DEFAULT_SYMBOLS;
      await fetchPrices(list, "individual");
    }
  } catch (error) {
    console.error("Error:", error?.message || error);
    process.exit(1);
  }
})();
