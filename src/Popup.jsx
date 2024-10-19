import {
  Button,
  Dialog,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getDB } from "./database";
import { dispatch } from "./events";

export function Popup(props) {
  const { onSaveSuccess, selectedId = -1, closeModal } = props;
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const onTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const onCodeChange = useCallback((e) => {
    setCode(e.target.value);
  }, []);

  const validate = useCallback(() => {
    if (title.length < 10) {
      toast.error("Title should be at least 10 characters long");
      return false;
    }

    if (code.length < 10) {
      toast.error("Code should be at least 10 characters long");
      return false;
    }

    return true;
  }, [title, code]);

  const onSave = useCallback(async () => {
    if (validate()) {
      const db = await getDB();
      const cleanCode = (code || "")
        .replaceAll("\n\n", "\n")
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line !== "")
        .join("\n");

      const curr = await db.get(selectedId);

      if (selectedId !== -1) {
        await db.update({ ...curr, id: selectedId, title, code: cleanCode });
        dispatch("updated", selectedId);
      } else {
        await db.create({ title, code, elapsed: 0, testCount: 0 });
        dispatch("added");
      }

      toast.success("Snippet saved!");
      closeModal?.();
      onSaveSuccess?.();
    }
  }, [title, code, selectedId]);

  const onDelete = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const db = await getDB();
    await db.delete(selectedId);
    setBusy(false);
    closeModal?.(selectedId);
    dispatch("deleted", selectedId);
  }, [selectedId]);

  const loadData = useCallback(async () => {
    if (selectedId !== -1 && selectedId !== null) {
      const db = await getDB();
      const data = await db.get(selectedId);
      setTitle(data.title);
      setCode(data.code);
    } else {
      setTitle("");
      setCode("");
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOpen = useMemo(() => selectedId !== null, [selectedId]);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Content maxWidth="800px" className="font-sans">
        <Dialog.Title className="font-sans">
          {selectedId !== -1 ? "Update code snippet" : "Add new snippet"}
        </Dialog.Title>
        <Dialog.Description></Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Title
            </Text>
            <TextField.Root
              placeholder="Enter title for new code snippet"
              value={title}
              onChange={onTitleChange}
              className="font-sans"
              maxLength={50}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Snippet
            </Text>
            <TextArea
              placeholder="console.log('Hello world!')"
              rows={24}
              className="font-sans [&>textarea]:whitespace-pre"
              value={code}
              onChange={onCodeChange}
            />
          </label>
        </Flex>

        <Flex mt="4" justify="between">
          <div>
            {selectedId !== -1 && (
              <Button
                variant="soft"
                color="red"
                onClick={onDelete}
                className="font-sans"
              >
                Delete
              </Button>
            )}
          </div>
          <Flex gap={"3"}>
            <Button
              variant="soft"
              color="gray"
              onClick={closeModal}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button onClick={onSave} className="font-sans">
              Save
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
