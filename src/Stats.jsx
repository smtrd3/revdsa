import { Dialog } from "@radix-ui/themes";
import { uniqueId } from "lodash-es";
import { useCallback, useState } from "react";
import { StatsContent } from "./StatsContent";
import { IconInfo } from "./icons";

export function Stats() {
  const [key, setKey] = useState("-");

  const onOpenChange = useCallback((open) => {
    if (open) {
      setKey(uniqueId());
    }
  }, []);

  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        <button className="text-white fixed right-1 top-1 bg-gray-950 p-2 rounded z-50">
          {IconInfo}
        </button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="800px">
        <Dialog.Title>Stats</Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <StatsContent updateKey={key} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
