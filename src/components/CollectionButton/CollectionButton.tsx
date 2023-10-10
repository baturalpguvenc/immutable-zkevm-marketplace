import {
  Avatar,
  createStyles,
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import router from "next/router";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
  },
}));

interface CollectionButtonProps extends UnstyledButtonProps {
  image: string;
  name: string;
  contractAddress: string;
  updatedAt: string;
  icon?: JSX.Element;
  description: string;
}

export function CollectionButton({
  image,
  name,
  contractAddress,
  updatedAt,
  description,
  icon,
  ...others
}: CollectionButtonProps) {
  const { classes } = useStyles();
  const handleClick = () => {
    router.push(`/collections/${contractAddress}`);
  };

  return (
    <UnstyledButton className={classes.user} onClick={handleClick} {...others}>
      <Group>
        <Avatar src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {name}
          </Text>

          <Text color="blue" size="xs">
            {description}
          </Text>

          <Text fw="800" size={10}>
            {new Date(updatedAt).toLocaleString("mm-dd")}
          </Text>
        </div>

        {icon || <IconChevronRight size="0.9rem" stroke={1.5} />}
      </Group>
    </UnstyledButton>
  );
}
