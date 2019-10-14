import React, { useState, useContext, useEffect } from "react";
import {
  PseudoBox,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatHelpText,
  StatArrow,
  StatNumber,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Spinner,
  Checkbox
} from "@chakra-ui/core";
import { AppContext, useWebSockets } from "../../utils";
import {
  NavigationBar,
  SubNavigationBar,
  ControlButton
} from "../../components";
import { FormComponent } from "./FormComponent";
import { flex } from "styled-system";

const MarketWithStat = ({ children, selected = false, onSelect, market }) => {
  const { prices, percent } = useWebSockets(
    `${market.coin.toUpperCase()}${market.buy_market.toUpperCase()}`,
    market.price_places
  );
  return (
    <PseudoBox
      flexBasis={["40%", "40%", "30%", "20%"]}
      my={[3, 1, 3]}
      textAlign="center"
      mx={3}
      py={1}
      tabIndex={0}
      height={["6em"]}
      borderWidth="3px"
      onClick={onSelect}
      _hover={{ cursor: "pointer" }}
      _focus={{ boxShadow: "outline" }}
      style={{ backgroundColor: selected ? "teal" : "inherit" }}
    >
      <Stat>
        <StatLabel>
          {prices === "Loading" ? "Loading Price" : "$" + prices}
        </StatLabel>
        <StatNumber>{children}</StatNumber>
        {percent ? (
          <StatHelpText>
            <StatArrow type={percent > 0 ? "increase" : "decrease"} />
            {percent}%
          </StatHelpText>
        ) : null}
      </Stat>
    </PseudoBox>
  );
};

const SidebarDrawer = ({ isOpen, onClose, btnRef, market, formFields }) => {
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
    >
      <DrawerOverlay />
      <DrawerContent maxHeight="100vh" overflowY="scroll">
        <DrawerCloseButton />
        <DrawerHeader>
          {!market ? `Create new market` : `Edit ${market} market`}
        </DrawerHeader>

        <DrawerBody>
          <Flex
            justifyContent={["space-between", "space-between", "flex-start"]}
            flexGrow={0.3}
            flexDirection={["column"]}
            // mx={3}
            my={5}
          >
            <FormComponent market={market} formFields={formFields} />
          </Flex>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
const MenuComponent = ({
  options = [],
  defaultText = "Menu",
  buttonProps = {},
  menuProps = {},
  renderItem = x => x,
  onMenuItemClick = () => {},
  withCheckbox = false,
  isSelected = () => false
}) => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon="chevron-down" {...buttonProps}>
        {defaultText}
      </MenuButton>
      <MenuList {...menuProps}>
        {options.map(param => {
          let child = (
            <MenuItem onClick={() => onMenuItemClick(param)}>
              {renderItem(param)}
            </MenuItem>
          );
          if (withCheckbox) {
            return (
              <Checkbox defaultIsChecked={isSelected(param)} ml={3}>
                {child}
              </Checkbox>
            );
          }
          return child;
        })}
      </MenuList>
    </Menu>
  );
};
function ConfigurationComponent({ params }) {
  let [selectedFields, setSelectedFields] = useState([]);
  return (
    <Flex direction="column">
      <Flex mt={5} mx={3}>
        <MenuComponent
          withCheckbox
          menuProps={{ display: "flex", flexDirection: "column" }}
          defaultText="Configurations"
          onMenuItemClick={item => {
            if (selectedFields.includes(item.value)) {
              setSelectedFields(selectedFields.filter(x => x !== item.value));
            } else {
              setSelectedFields([...selectedFields, item.value]);
            }
          }}
          options={params.map(x => ({ name: x.label, value: x.name }))}
          renderItem={x => x.name}
          isSelected={item => {
            return selectedFields.includes(item.value);
          }}
        />
      </Flex>
      <Flex
        justifyContent={["space-between", "space-between", "flex-start"]}
        flexGrow={0.3}
        flexDirection={["column", "row"]}
        // mx={3}
        flexWrap="wrap"
        my={5}
      >
        <FormComponent
          componentProps={{ mb: 4 }}
          formFields={params.filter(x => selectedFields.includes(x.name))}
        />
      </Flex>
    </Flex>
  );
}
export function Market({ match, history }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const { markets, loading, getMarket, getFormFields } = useContext(AppContext);

  let [selectedMarkets, setSelectedMarkets] = useState([
    // "BTC/USDT",
    // "ETH/USDT"
  ]);
  let [newEditItem, setNewEditItem] = useState();

  function addOrRemoveMarkets(_market) {
    if (selectedMarkets.includes(_market)) {
      setSelectedMarkets(selectedMarkets.filter(x => x !== _market));
      setNewEditItem(undefined);
    } else {
      setSelectedMarkets([...selectedMarkets, _market]);
      setNewEditItem(_market);
    }
  }
  useEffect(() => {
    getMarket(match.params.account);
  }, []);
  let routes = [
    { name: "Home", path: "/" },
    {
      name: match.params.account,
      path: `/${match.params.account}/markets`,
      current: true
    }
  ];
  return (
    <Box className="App">
      <NavigationBar title="Main Account Markets">
        <MenuComponent
          defaultText="Filter"
          options={[
            "All Markets",
            "BTC Markets",
            "USDT Markets",
            "ETH Markets",
            "BNB Markets"
          ]}
          menuProps={{ background: "teal" }}
          buttonProps={{ variantColor: "teal", variant: "solid" }}
        />
        <SidebarDrawer
          {...{
            isOpen,
            onClose,
            btnRef,
            market: newEditItem,
            formFields: getFormFields()
          }}
        />
      </NavigationBar>
      <Box px={6} pt={3}>
        <SubNavigationBar routes={routes} />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" height="20em">
          <Spinner alignSelf="center" />
        </Box>
      ) : (
        <Flex
          flexDirection="column"
          justifyContent={["space-between", "inherit"]}
          mx={3}
          // width={['100%',"100%","80%"]}
          minHeight="90vh"
        >
          <Box pt={5}>
            <Stack
              isInline
              spacing={8}
              justifyContent={["space-between", "space-between", "flex-start"]}
              flexWrap="wrap"
              maxHeight="400px"
              overflowY="scroll"
            >
              {markets.map(market => {
                return (
                  <MarketWithStat
                    key={market.market_label()}
                    onSelect={() => {
                      addOrRemoveMarkets(market.market_label());
                    }}
                    market={market}
                    selected={selectedMarkets.includes(market.market_label())}
                  >
                    {market.market_label()}
                  </MarketWithStat>
                );
              })}
            </Stack>
          </Box>
          {selectedMarkets.length > 1 ? (
            <ConfigurationComponent params={getFormFields("bulk")} />
          ) : (
            <>
              <ControlButton
                btnRef={btnRef}
                onClick={selectedMarkets.length === 1 ? onOpen : onOpen}
                icon={selectedMarkets.length === 1 ? "edit" : "add"}
                variantColor="pink"
                style={{
                  right: "2em",
                  bottom: "2em"
                }}
              />
              {selectedMarkets.length === 1 && (
                <ControlButton
                  btnRef={btnRef}
                  onClick={selectedMarkets.length === 1 ? onOpen : onOpen}
                  icon={"calendar"}
                  variantColor="teal"
                  style={{
                    right: "6em",
                    bottom: "2em"
                  }}
                />
              )}
            </>
          )}
          <Button
            position={["relative", "fixed"]}
            style={{ bottom: "2em" }}
            mt={["2em", "inherit"]}
            variantColor="blue"
            width="50%"
            mb={3}
          >
            Submit
          </Button>
        </Flex>
      )}
    </Box>
  );
}
