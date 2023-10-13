import { useState } from "react";
import NextApp, { AppContext, AppProps } from "next/app";
import { getCookie, setCookie } from "cookies-next";

import Head from "next/head";
import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { Web3ProviderContextProvider } from "@/contexts/Web3ProviderContext";
import { WidgetProvider } from "@/hooks/orchestration";
import { HeaderSearch } from "@/components/HeaderSearch/HeaderSearch";
import { CartContext, Orders } from "@/contexts/CartContext";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );
  const [orders, setOrders] = useState<Orders>([]);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <>
      <Head>
        <title>Marketplace</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

      <CartContext.Provider value={{ orders, setOrders }}>
        <Web3ProviderContextProvider>
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <MantineProvider
              theme={{ colorScheme }}
              withGlobalStyles
              withNormalizeCSS
            >
              <WidgetProvider>
                <AppShell
                  header={
                    <HeaderSearch
                      links={[
                        { label: "Home", link: "/" },
                        {
                          label: "Assets",
                          link: "/assets",
                        },
                        {
                          label: "Cart",
                          link: "/cart",
                        },
                      ]}
                    />
                  }
                >
                  <Component {...pageProps} />
                </AppShell>
              </WidgetProvider>
              <Notifications />
            </MantineProvider>
          </ColorSchemeProvider>
        </Web3ProviderContextProvider>
      </CartContext.Provider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "dark",
  };
};
