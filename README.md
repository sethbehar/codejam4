# Stock Price Tracker

A command-line application that displays real-time stock prices using the Yahoo Finance API.

## Features

- **Individual Stock Lookup**: Look up prices for any stock symbols
- **Live Market Overview**: View a live-updating table of major tech stocks (AAPL, MSFT, NVDA, AMZN)
- **Real-time Updates**: Auto-refreshes every 10 seconds in table mode
- **Current Time Display**: Shows the latest update time for all quotes

## Prerequisites

- Node.js (v20.11.0 or higher)
- npm (Node Package Manager)

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

## Dependencies

- [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2): For fetching real-time stock data

## Error Handling

The application includes error handling for:
- Invalid stock symbols
- Network connectivity issues
- API response errors

## License

MIT License
