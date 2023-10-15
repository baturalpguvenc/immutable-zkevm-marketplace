import { useCallback, useContext, useState } from "react";
import Link from "next/link";
import {
  Button,
  Container,
  createStyles,
  Group,
  Header,
  rem,
  Text,
} from "@mantine/core";

import { IconWallet } from "@tabler/icons-react";
import { Web3Context } from "@/contexts/Web3ProviderContext";

import { hideAllWidgets, WidgetContext } from "@/hooks/orchestration";
import { useConnectWidget } from "@/hooks/useConnectWidget";
import { useWalletWidget } from "@/hooks/useWalletWidget";

import { ImmutableWidget } from "@/components/ImmutableWidget/ImmutableWidget";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle/ColorSchemeToggle";

const useStyles = createStyles((theme) => ({
  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },

  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  search: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface HeaderSearchProps {
  links: { link: string; label: string }[];
}

export function HeaderSearch({ links }: HeaderSearchProps) {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState(links[0].link);

  // Widget context state for showing/hiding widgets
  const { web3Provider, setWeb3Provider } = useContext(Web3Context);
  const {
    showWidgets: { showConnect, showWallet, showSwap, showBridge },
    setShowWidgets,
  } = useContext(WidgetContext);

  // Hooks for each widget to propagate web3 provider from event.
  useConnectWidget(setWeb3Provider);
  useWalletWidget(setWeb3Provider);

  // Controls the opening and closing of the widget window
  const openConnectWidget = useCallback(() => {
    setShowWidgets({
      ...hideAllWidgets,
      showConnect: { show: true, data: {} },
    });
  }, [setShowWidgets]);

  const openWalletWidget = useCallback(() => {
    setShowWidgets({ ...hideAllWidgets, showWallet: { show: true, data: {} } });
  }, [setShowWidgets]);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: active === link.link,
      })}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <Header height={56} className={classes.header} mb={120}>
      <Container size="lg" className={classes.inner}>
        <Group spacing="xs">
          <Text variant="gradient" component="span" weight="600">
            Marketplace
          </Text>
        </Group>

        <Group>
          <Group ml={50} spacing={5} className={classes.links}>
            {items}
          </Group>
          <ColorSchemeToggle />
          <Button
            leftIcon={<IconWallet size="1rem" />}
            onClick={web3Provider ? openWalletWidget : openConnectWidget}
            variant="light"
          >
            {web3Provider === undefined ? "Connect" : "My Wallet"}
          </Button>
          {web3Provider ? <Button onClick={() => setWeb3Provider(undefined)} variant="light">Disconnect</Button> : <></>}
        </Group>
      </Container>
      <Group position="right">
        <ImmutableWidget
          web3Provider={web3Provider}
          showConnect={showConnect}
          showWallet={showWallet}
          showSwap={showSwap}
          showBridge={showBridge}
        />
      </Group>
    </Header>
  );
}
