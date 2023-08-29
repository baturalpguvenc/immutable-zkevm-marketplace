import { Avatar, createStyles, Group, Text } from "@mantine/core";
import { IconAlarm, IconAt } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

interface CollectionInfoProps {
  avatar: string;
  name: string;
  title: string;
  created: string;
  description: string;
}

export function CollectionInfo({
  avatar,
  name,
  title,
  created,
  description,
}: CollectionInfoProps) {
  const { classes } = useStyles();
  return (
    <div>
      <Group noWrap>
        <Avatar src={avatar} size={94} radius="md" />
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            {title}
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            {name}
          </Text>

          <Group noWrap spacing={10} mt={3}>
            <IconAt stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {description}
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <IconAlarm stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {created}
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}
