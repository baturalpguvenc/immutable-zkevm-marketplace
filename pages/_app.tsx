import { useEffect, useState } from "react";
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
import { HeaderSearch } from "../components/HeaderSearch/HeaderSearch";
import { IconSearch } from "@tabler/icons-react";
import { SpotlightProvider } from "@mantine/spotlight";
import React from "react";
import { WidgetProvider } from "../src/orchestration";
import { Web3ProviderContextProvider } from "../src/Web3ProviderContext";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

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
        <title>Demarkt</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

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
            <SpotlightProvider
              shortcut={["mod + P", "mod + K", "/"]}
              actions={[]}
              searchIcon={<IconSearch size="1.2rem" />}
              searchPlaceholder="Search..."
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
                      ]}
                    />
                  }
                >
                  <Component {...pageProps} />
                </AppShell>
              </WidgetProvider>
            </SpotlightProvider>
            <Notifications />
          </MantineProvider>
        </ColorSchemeProvider>
      </Web3ProviderContextProvider>
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
