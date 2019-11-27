import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Input,
  FormControl,
  FormLabel,
  Code,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Button,
  Spinner,
  Flex,
  useToast
} from "@chakra-ui/core";
import { AppContext } from "../../utils";
import { useDisclosure } from "@chakra-ui/core";
import { useAccountMarket } from "../../hooks";

// import { supported_markets } from "../../data";
/**
 *
 * {
 * "text":},
 * "json":{}
 */
import { XModal } from "../../components";

export function MarketAnalyzer({
  textBlob,

  analyzeLoader,
  onsubmit,
  defaultConfig = {}
}) {
  return (
    <Box display="flex" flex={0.95} flexDirection="column">
      <MarketDetailsForm onsubmit={onsubmit} defaultConfig={defaultConfig} />

      {analyzeLoader ? (
        <Box textAlign="center" mt={20}>
          <Spinner alignSelf="center" textAlign="center" />
        </Box>
      ) : (
        textBlob && (
          <Code
            width={"100%"}
            maxHeight={"500px"}
            overflowY="scroll"
            pl={2}
            py={4}
          >
            {/**textBlob.split("\n").map(text => {
              if (text.trim() === "") {
                return <br />;
              }
              return text;
            })**/}
            {textBlob.text}
          </Code>
        )
      )}
    </Box>
  );
}
function useSupportedMarkets(coin) {
  let [supported_markets, setSupported_markets] = useState([]);
  let [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSupportedMarkets().then(result => {
      setSupported_markets(result);
      setLoading(false);
    });
  }, []);
  const markets = [
    "USDT",
    "tusd",
    "BTC",
    "bnb",
    "eth",
    "usdc",
    "pax",
    "busd",
    "xrp",
    "trx"
  ];
  const getSupportedMarkets = () => {
    return new Promise((reslove, reject) => {
      setTimeout(() => {
        reslove(markets);
      }, 2000);
    });
  };

  return [supported_markets, loading];
}
export function MarketDetailsForm({
  onsubmit,
  textBlob,

  defaultConfig = { multiplier: 1, spread_multiplier: 1 }
}) {
  let [config, setConfig] = useState(defaultConfig);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [supported_markets, loading] = useSupportedMarkets(config.coin);
  let { accounts = [], adapter } = useContext(AppContext);
  const toast = useToast();

  const handleChange = input => e => {
    let value = e.target.value;
    console.log(value);
    // value=value;
    let newConfig = { ...config, [input]: value };
    setConfig(newConfig);
  };
  const updateRange = input => x => {
    let newConfig = { ...config, [input]: x };
    setConfig(newConfig);
  };
  function onSaveHandler(event) {
    return onsubmit(config);
  }
  function displayToast(description) {
    toast({
      title: "Markets transferred",
      description,
      status: "success",
      duration: 5000,
      isClosable: true
    });
  }
  function onSumit() {
    onClose();
    // if (formValues.from && formValues.market && formValues.to) {
    displayToast(`Market has been sent `);
    // display toast message when successful
    //   adapter.transferMarket(formValues.market);
    //   setFormValues({});
    // }
    console.log("Market Sent");
  }

  return (
    <Box display="flex" flex={0.95} flexDirection="column">
      <Box flexWrap="wrap" display="flex">
        <FormControl width="42%" mb={1} mx={3} isRequired>
          <FormLabel htmlFor="market">Market</FormLabel>
          {loading ? (
            <Box ml={2}>
              <Spinner alignSelf="center" textAlign="center" />
            </Box>
          ) : (
            <Select
              value={config.buy_market}
              id="market"
              onChange={handleChange("market")}
            >
              (
              {supported_markets.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </FormControl>
        <FormControl mb={1} width="42%" mx={3} isRequired>
          <FormLabel htmlFor="buy_amount">Buy Amount</FormLabel>
          <Input
            value={config.buy_amount}
            onChange={handleChange("buy_amount")}
            type="number"
            name="buy_amount"
          />
        </FormControl>
        <FormControl width="42%" mb={1} mx={3} isRequired display="none">
          <FormLabel htmlFor="interval">Interval</FormLabel>
          <Select>
            <option>1d</option>
          </Select>
        </FormControl>
        <FormControl mb={1} width="42%" mx={3} isRequired display="none">
          <FormLabel htmlFor="budget">Budget</FormLabel>
          <Input
            value={config.budget}
            onChange={handleChange("budget")}
            type="number"
          />
        </FormControl>
        <FormControl mb={1} width="42%" mx={3} isRequired display="none">
          <FormLabel htmlFor="profit">Profit</FormLabel>
          <Input
            value={config.profit}
            onChange={handleChange("profit")}
            type="number"
          />
        </FormControl>
        <FormControl width="100%" mb={1} mx={3} isRequired>
          <FormLabel htmlFor="multiplier">Multiplier</FormLabel>
          <Slider
            defaultValue={config.multiplier}
            onChange={updateRange("multiplier")}
          >
            <SliderTrack />
            <SliderFilledTrack />
            <SliderThumb size={6}>
              <Box color="tomato" as={Text} children={config.multiplier} />
            </SliderThumb>
          </Slider>
        </FormControl>
        <FormControl width="100%" mb={1} mx={3} isRequired>
          <FormLabel htmlFor="spread">Spread Multiplier</FormLabel>
          <Slider defaultValue={config.spread} onChange={updateRange("spread")}>
            <SliderTrack />
            <SliderFilledTrack />
            <SliderThumb size={6}>
              <Box color="tomato" as={Text} children={config.spread} />
            </SliderThumb>
          </Slider>
        </FormControl>
        <Box w="100%">
          <Flex justifyContent="space-between">
            <Button onClick={onSaveHandler}>Submit</Button>
            {textBlob ? (
              <Button variantColor="teal" onClick={onOpen}>
                create
              </Button>
            ) : null}
          </Flex>
        </Box>
      </Box>

      <XModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSumit}
        title="To Account"
        submitButtonProps={{ variantColor: "blue" }}
      >
        <Box pb={6} ml={7}>
          <FormControl mb={1} mx={3} isRequired>
            <FormLabel htmlFor="Account"> Account</FormLabel>
            <Select value={accounts.title} onChange={handleModalInput}>
              <option>Select Account</option>
              {accounts.map(option => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </XModal>
    </Box>
  );
}

function handleModalInput(e) {
  let value = e.target.value;
  console.log(value);
}
