# MattGoods Stock Screener & Paper Trading

A CLI App that uses the YahooFinance Library to screen stocks and simulate paper trading

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/sethbehar/codejam4.git
   cd codejam4
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Paper Trader
To simulate an account with $50,000, run

```bash
node game.js
```
This will boot up a paper trading account, allowing you to view stocks, buy, and sell, to grow your portfolio

### Individual Stock Lookup
To look up one or more specific stocks:
```bash
node index.js AAPL              # Look up a single stock
node index.js AAPL MSFT GOOGL   # Look up multiple stocks
```

### Live Market Overview
To view the live-updating table of major tech stocks:
```bash
node index.js --table
```
This will show a continuously updating table with:
- Apple (AAPL)
- Microsoft (MSFT)
- NVIDIA (NVDA)
- Amazon (AMZN)

The table automatically refreshes every 10 seconds. Press `Ctrl+C` to exit.

To view the live-updating table with stocks of your choice:
```bash
node index.js NVDA AAPL HPE QTUM IONQ --table
```

## Output Examples

### Individual Stock View
```
📈 Apple Inc.
Symbol: AAPL
Price: 270.43 USD
Change: 0.73 (0.27%)
Time: 10/30/2023, 2:30 PM
```

### Table View
```
📊 Live Stock Tracker (Press Ctrl+C to exit)

Market Overview - 10/30/2023, 2:30 PM
┌─────────┬────────────────┬──────────────┬────────────────────┐
│ Symbol  │ Name           │ Price        │ Change             │
├─────────┼────────────────┼──────────────┼────────────────────┤
│ AAPL    │ Apple Inc.     │ 270.43 USD   │ 0.73 (0.27%)       │
│ MSFT    │ Microsoft      │ 345.67 USD   │ 2.31 (0.67%)       │
│ NVDA    │ NVIDIA Corp    │ 456.78 USD   │ -1.23 (-0.27%)     │
│ AMZN    │ Amazon.com     │ 123.45 USD   │ 0.98 (0.80%)       │
└─────────┴────────────────┴──────────────┴────────────────────┘
```

