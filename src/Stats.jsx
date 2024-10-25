import { Button, Dialog } from "@radix-ui/themes";
import { uniqueId } from "lodash-es";
import { useCallback, useState } from "react";
import { StatsContent } from "./StatsContent";
import { IconInfo } from "./icons";
import { getDB } from "./database";
import { dispatch } from "./events";

export function Stats() {
  const [key, setKey] = useState("-");

  const onOpenChange = useCallback((open) => {
    if (open) {
      setKey(uniqueId());
    }
  }, []);

  const onExport = useCallback(async () => {
    const db = await getDB();
    const snippets = await db.getAll();

    const blob = new Blob([JSON.stringify(snippets)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snippets.json";
    a.click();
  }, []);

  const onImport = useCallback(async () => {
    const file = await window.showOpenFilePicker();
    const fileHandle = file[0];
    const fileData = await fileHandle.getFile();
    const rawJson = await fileData.text();
    const snippets = JSON.parse(rawJson);

    const db = await getDB();

    for (const snippet of snippets) {
      delete snippet.id;
      await db.create(snippet);
      dispatch("added");
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
        <Dialog.Title>
          <div className="flex justify-between">
            <span>Stats</span>
            <div className="flex gap-2">
              <Button onClick={onExport}>Export</Button>
              <Button variant="outline" onClick={onImport}>
                Import
              </Button>
            </div>
          </div>
        </Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <StatsContent updateKey={key} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
