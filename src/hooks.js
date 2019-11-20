import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "./utils";

export function useNotification() {
  let [messages, setMessages] = useState([]);
  const connections = useRef({});
  function _disconnectSocketStreams(streams) {
    // streams = streams.join("/");
    let connection = btoa(streams);
    // console.log(connections.current[connection].readyState)
    // console.log(WebSocket.OPEN)
    if (connections.current[connection].readyState === WebSocket.OPEN) {
      connections.current[connection].close();
    }
  }
  useEffect(() => {
    function _connectSocketStreams(streams) {
      // streams = streams.join("/");
      let connection = btoa(streams);
      // console.log(connection);
      connections.current[connection] = new WebSocket(
        ` wss://tuteria.ngrok.io/redis`
        // `wss://stream.binance.com:9443/stream?streams=${streams}`
        // `wss://stream.binance.com:9443/stream?streams=${streams}`
      );
      connections.current[connection].onmessage = evt => {
        let result = JSON.parse(evt.data);
        console.log(result);
        if (messages.length < 20) {
          setMessages([...messages, result]);
        } else {
          setMessages([result]);
        }
        // addPrice(result);
      };
      connections.current[connection].onerror = evt => {
        console.error(evt);
      };
    }
    _connectSocketStreams("sample");
    return () => {
      _disconnectSocketStreams("sample");
    };
  });
  return { messages };
}

export function useWebSockets(market, price_places = ".0f", currency) {
  let places = price_places.replace(".", "").replace("f", "");
  const connections = useRef({});
  let [allStreams, setAllStreams] = useState([
    market.toLowerCase() + "@ticker"
  ]);
  let [prices, setPrices] = useState("Loading");
  let [percent, setPercent] = useState();

  function _disconnectSocketStreams(streams) {
    streams = streams.join("/");
    let connection = btoa(streams);
    // console.log(connections.current[connection].readyState)
    // console.log(WebSocket.OPEN)
    if (connections.current[connection].readyState === WebSocket.OPEN) {
      connections.current[connection].close();
    }
  }
  useEffect(() => {
    function addPrice(newPrice) {
      let result = parseFloat(newPrice.c).toFixed(parseInt(places, 10));
      setPrices(result);
      setPercent(parseFloat(newPrice.P));
    }
    function _connectSocketStreams(streams) {
      streams = streams.join("/");
      let connection = btoa(streams);
      connections.current[connection] = new WebSocket(
        ` wss://stream.binance.com:9443/ws/${streams}`
        // `wss://stream.binance.com:9443/stream?streams=${streams}`
        // `wss://stream.binance.com:9443/stream?streams=${streams}`
      );
      connections.current[connection].onmessage = evt => {
        let result = JSON.parse(evt.data);
        // console.log(evt.data);
        addPrice(result);
      };
      connections.current[connection].onerror = evt => {
        console.error(evt);
      };
    }
    _connectSocketStreams(allStreams);
    return () => {
      _disconnectSocketStreams(allStreams);
    };
  }, [allStreams, places]);
  return {
    prices,
    percent
  };
}

export function useMarketData(prices, market, full_market) {
  let [coinValue, setCoinValue] = useState();
  let [tradeInfo, setTradeInfo] = useState({});
  let [loaded, setLoaded] = useState(false);
  let places = market.price_places;

  useEffect(() => {
    if (prices !== "Loading") {
      getTradeInfoFormMarket(full_market, prices).then(
        ({ coinValue, tradeValue }) => {
          setCoinValue(coinValue);
          setTradeInfo(tradeValue);
          setLoaded(true);
        }
      );
    }

    function change2num(places) {
      let s = places.replace("f", "").replace(".", "");
      let f = parseFloat(s);
      return f;
    }

    let decimal_places = change2num(places);

    function getTradeInfoFormMarket(market_name, _prices) {
      return new Promise((resolve, reject) => {
        let result = determineSellValue(_prices);
        resolve({
          coinValue: 24,
          tradeValue: {
            buy_amount: _prices,
            sell_amount: result.price.toFixed(decimal_places),
            buy_value: (market.buy_amount * market.multiplier).toFixed(
              decimal_places
            ),
            sell_value: result.value.toFixed(decimal_places)
          }
        });
      });
    }
    function determineSellValue(currentPrice) {
      let workingSpread = market.spread * (market.spread_multiplier || 1);
      let buy_amount = (market.buy_amount || 10.1) * (market.multiplier || 1);
      let currentQuantity = buy_amount / parseFloat(currentPrice);
      let sellPrice = parseFloat(currentPrice) + workingSpread;
      // console.log({ workingSpread, buy_amount, currentQuantity, sellPrice });
      let sellValue = currentQuantity * sellPrice;
      return { price: sellPrice, value: sellValue };
    }
  }, [prices, full_market, market, places]);
  let info = {
    buy_amount: tradeInfo.buy_amount,
    sell_amount: tradeInfo.sell_amount,
    buy_value: tradeInfo.buy_value,
    sell_value: tradeInfo.sell_value,
    coin_value: coinValue,
    spread: market.spread * (market.spread_multiplier || 1)
  };

  return {
    info,
    loaded
  };
}
export function useGetData(market) {
  let [data, setData] = useState([]);
  let [analyzeLoader, setLoader] = useState(false);
  let [transactionLoader, setTransactionLoader] = useState(false);
  let { adapter } = useContext(AppContext);
  useEffect(() => {
    getData(market).then(result => {
      setData(result);
    });
  }, [market]);
  function analyzeMarket(params) {
    setLoader(true);
    return adapter.analyzeMarket(params).then(result => {
      setLoader(false);
      // return result;
      return result.replace(/\n/g, "\n\n");
    });
  }
  function getData(mk) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setTransactionLoader(false);
        resolve([
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          {
            date: "2019-10-01",
            market: "ETHUSDT",
            amount: 45.323,
            profit: 2.3
          },
          { date: "2019-10-01", market: "ETHUSDT", amount: 45.323, profit: 2.3 }
        ]);
      }, 3000);
      setTransactionLoader(true);
    });
  }
  return { data, analyzeMarket, analyzeLoader, transactionLoader };
}

export function useAccountMarket(account) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState();
  const { getMarket, storage } = useContext(AppContext);
  useEffect(() => {
    if (account) {
      getSavedMarkets(refresh);
    }
  }, [refresh]);
  function getSavedMarkets(forced) {
    if (forced) {
      getMarkets();
    } else {
      let markets = storage.get(account) || [];
      if (markets.length > 0) {
        setLoading(false);
        setMarkets(markets);
        setRefresh(false);
      } else {
        getMarkets();
      }
    }
  }
  function getMarkets() {
    setLoading(true);
    getMarket(account).then(mk => {
      storage.set(account, mk);
      getSavedMarkets(false);
    });
  }
  function refreshLoader() {
    setRefresh(true);
  }
  function getSpecificMarket(_market = {}) {
    if (_market.coin && _market.market) {
      let result = markets.find(_mk => {
        return (
          _mk.coin.toLowerCase() === _market.coin.toLowerCase() &&
          _mk.buy_market.toLowerCase() === _market.market.toLowerCase()
        );
      });
      if (result) {
        return {
          ...result,
          market_label: () => {
            return `${result.coin}/${result.buy_market}`;
          }
        };
      }
    }
    // set the default value for the market when one does not exist
    return {
      ..._market,
      multiplier: 1,
      spread_multiplier: 1,
      interval: "1d",
      buy_amount: 10.1
    };
  }
  return {
    markets: markets.map(x => ({
      ...x,
      market_label: () => {
        return `${x.coin}/${x.buy_market}`;
      }
    })),
    getSpecificMarket,
    setMarkets,
    loading,
    setRefresh: refreshLoader
  };
}
