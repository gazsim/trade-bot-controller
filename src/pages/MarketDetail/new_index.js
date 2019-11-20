import React, { useEffect, useState } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/core";
import { NavigationBar, SubNavigationBar } from "../../components";

import { useNotification, useGetData } from "../../hooks";
import { MarketTransaction } from "./MarketTransaction";
import { MarketAnalyzer } from "./MarketAnalyzer";

export const MarketDetail = ({ match, pageProps }) => {
  let { messages } = useNotification();
  let { market, account } = match.params;
  let { data, analyzeMarket, analyzeLoader, transactionLoader } = useGetData(
    market
  );
  let [textBlob, setTextBlob] = useState();

  let remaingRoutes = account
    ? [
        {
          name: account,
          path: `/${account}/markets`
        },
        {
          name: market,
          path: `/markets/${market}`,
          current: true
        }
      ]
    : [
        {
          name: market,
          path: `/markets/${market}`,
          current: true
        }
      ];
  let routes = [{ name: "Home", path: "/" }, ...remaingRoutes];
  let markets = ["usdt", "tusd", "busd", "usdc", "usds", "btc"];
  function getCoin() {
    let foundMarket = markets.find(x => {
      let b = market.includes(x);
      return b;
    });
    if (foundMarket) {
      let coin = market.slice(0, -foundMarket.length);
      return { coin, market: foundMarket };
    } else {
      return {};
    }
  }
  let { getSpecificMarket } = pageProps;
  let defaultConfig = getSpecificMarket(getCoin()); // {coin,market} "ethbtc"
  function onsubmit(config) {
    analyzeMarket({
      coin: "ont",
      market: "USDT",
      buy_amount: 10.1,
      spread_multiplier: 1,
      multiplier: 1,
      interval: "1d"
    }).then(data => {
      setTextBlob(data);
    });
    // setConfig(newConfig);
    // console.log(newConfig);
  }
  return (
    <Box className="App">
      <NavigationBar title="Market Detail" />
      <Box px={6} pt={3}>
        <SubNavigationBar routes={routes} />
      </Box>
      <flex px={6}>
        <Flex p={"20px"} justifyContent="space-between">
          {account ? (
            <Flex direction="column" flex={1} mr={2}>
              {transactionLoader ? (
                <Box textAlign="center" mt={20}>
                  <Spinner alignSelf="center" textAlign="center" />
                </Box>
              ) : (
                <MarketTransaction messages={messages} data={data} />
              )}
            </Flex>
          ) : null}
          <MarketAnalyzer
            {...{ analyzeLoader, textBlob, defaultConfig, onsubmit }}
          />
        </Flex>
      </flex>
    </Box>
  );
};

// get the list of running trades
// display the completed trades filterable by from and to date
// ability to determine new spread multiplier or multiplier to use
// ability to cancel all running trades so that a new one is recreated
