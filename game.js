#!/usr/bin/env node
// paper-game.js — ultra-simple paper trading loop

import YahooFinance from "yahoo-finance2";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ------------------ Config & State ------------------
const STARTING_BALANCE = 50_000;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

let balance = STARTING_BALANCE;
/**
 * portfolio holds at most one lot per symbol:
 * { [SYM]: { qty: number, buyPrice: number, peAtBuy: number|null, timestamp: string } }
 */
const portfolio = Object.create(null);

// ------------------ Helpers ------------------
function isMultipleOf5(n) {
  return Number.isInteger(n) && n > 0 && n % 5 === 0;
}

function formatMoney(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function nowStamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function getBasicQuote(symbol) {
  const sym = String(symbol || "").trim().toUpperCase();
  if (!sym) throw new Error("No symbol provided");
  const q = await yahooFinance.quote(sym);
  if (!q || typeof q.regularMarketPrice !== "number") {
    throw new Error(`No price for ${sym}`);
  }
  return {
    symbol: q.symbol || sym,
    name: q.shortName || sym,
    price: q.regularMarketPrice,
    currency: q.currency || "USD",
    pe: typeof q.trailingPE === "number" ? q.trailingPE : null, // keep it simple
  };
}

async function showMenu(rl) {
  console.log("\n=== Paper Trader ===");
  console.log("1) View balance / holdings");
  console.log("2) Buy stock");
  console.log("3) Sell stock");
  console.log("4) View stock");
  console.log("5) Exit");
  const choice = await rl.question("> Choose an option (1-5): ");
  return choice.trim();
}

function showBalanceAndHoldings() {
  console.log("\n--- Account ---");
  console.log("Cash:", formatMoney(balance));
  const symbols = Object.keys(portfolio);
  if (symbols.length === 0) {
    console.log("Holdings: (none)\n");
    return;
  }
  console.log("Holdings:");
  for (const sym of symbols) {
    const p = portfolio[sym];
    console.log(
      `  ${sym} — qty: ${p.qty}, buyPrice: ${formatMoney(p.buyPrice)}, bought: ${p.timestamp}`
    );
  }
  console.log("");
}

// ------------------ Actions ------------------
async function actionBuy(rl) {
  const sym = (await rl.question("Symbol to BUY: ")).trim().toUpperCase();
  if (!sym) return console.log("Cancelled.");

  if (portfolio[sym]) {
    console.log("You already own a lot of this symbol. Sell it before buying again.");
    return;
  }

  const qtyStr = (await rl.question("Quantity (multiple of 5): ")).trim();
  const qty = Number(qtyStr);
  if (!isMultipleOf5(qty)) {
    console.log("Quantity must be a positive multiple of 5.");
    return;
  }

  try {
    const q = await getBasicQuote(sym);
    const cost = q.price * qty;
    if (cost > balance) {
      console.log(`Insufficient cash. Need ${formatMoney(cost)}, have ${formatMoney(balance)}.`);
      return;
    }
    balance -= cost;
    portfolio[q.symbol] = {
      qty,
      buyPrice: q.price,
      peAtBuy: q.pe,
      timestamp: nowStamp(),
    };
    console.log(
      `Bought ${qty} ${q.symbol} @ ${formatMoney(q.price)}. New cash: ${formatMoney(balance)}.`
    );
  } catch (err) {
    console.log("Buy failed:", err?.message || err);
  }
}

async function actionSell(rl) {
  const sym = (await rl.question("Stock Symbol to SELL (ex: AAPL, NVDA): ")).trim().toUpperCase();
  if (!sym) return console.log("Cancelled.");

  const lot = portfolio[sym];
  if (!lot) {
    console.log("\nYou don't own this stock....\n");
    return;
  }

  try {
    const q = await getBasicQuote(sym);
    const proceeds = q.price * lot.qty;
    const pnl = (q.price - lot.buyPrice) * lot.qty;

    balance += proceeds;
    delete portfolio[sym];

    console.log(
      `Sold ${lot.qty} ${sym} @ ${formatMoney(q.price)} for ${formatMoney(proceeds)}.`
    );
    console.log(
      `P&L vs buy @ ${formatMoney(lot.buyPrice)}: ${pnl >= 0 ? "+" : ""}${formatMoney(pnl)}`
    );
    console.log(`New cash: ${formatMoney(balance)}.`);
  } catch (err) {
    console.log("Sell failed:", err?.message || err);
  }
}

async function actionViewStock(rl) {
  const sym = (await rl.question("Stock Symbol to VIEW (ex: AAPL, NVDA): ")).trim().toUpperCase();
  if (!sym) return console.log("\nCancelled.\n");

  try {
    const q = await getBasicQuote(sym);
    console.log(`\n${q.name} (${q.symbol})`);
    console.log(`Price: ${formatMoney(q.price)} ${q.currency}`);
    console.log(`P/E: ${q.pe ?? "N/A"}`);
    const owned = portfolio[q.symbol];
    if (owned) {
      const upnl = (q.price - owned.buyPrice) * owned.qty;
      console.log(
        `Owned: qty ${owned.qty} @ ${formatMoney(owned.buyPrice)}`
      );
    }
    console.log("");
  } catch (err) {
    console.log("View failed:", err?.message || err);
  }
}

// ------------------ Main Loop ------------------
(async function main() {
  const rl = readline.createInterface({ input, output, terminal: true });
  console.log(`\nWelcome! Starting cash: ${formatMoney(STARTING_BALANCE)}.`);

  while (true) {
    const choice = await showMenu(rl);
    if (choice === "1") {
      showBalanceAndHoldings();
    } else if (choice === "2") {
      await actionBuy(rl);
    } else if (choice === "3") {
      await actionSell(rl);
    } else if (choice === "4") {
      await actionViewStock(rl);
    } else if (choice === "5") {
      break;
    } else {
      console.log("Please choose 1-5.");
    }
  }

  rl.close();
  console.log("\nGoodbye!\n");
})();
