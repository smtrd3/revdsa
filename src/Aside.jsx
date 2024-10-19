import cx from "classnames";
import { find, get, map, sample, uniqueId } from "lodash-es";
import { useCallback, useEffect, useState } from "react";
import { Popup } from "./Popup";
import { getDB } from "./database";
import { listen } from "./events";
import { IconAdd, IconEdit } from "./icons";

export function Aside(props) {
  const {
    sidebarOpen = false,
    onSelect,
    toggleSidebar,
    allowEdit,
    selectedId,
  } = props;
  const [items, setItems] = useState([]);
  const [updateKey, setUpdateKey] = useState("-");
  const [editId, setEditItem] = useState(null);

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  });

  const sync = useCallback(async () => {
    const db = await getDB();
    const items = await db.getAll();
    setItems(items);
  }, []);

  const onSaveSuccess = useCallback(() => {
    setUpdateKey(uniqueId());
  }, []);

  const createNew = useCallback(() => {
    setEditItem(-1);
    setUpdateKey(uniqueId());
  }, []);

  const closeModal = useCallback(() => {
    setEditItem(null);
    setUpdateKey(uniqueId());
  }, []);

  const editItem = useCallback((id) => {
    setEditItem(id);
    setUpdateKey(uniqueId());
  }, []);

  const onSelectionChange = useCallback((e, id) => {
    toggleSidebar(e);
    onSelect(id);
  }, []);

  useEffect(() => {
    sync();
  }, [updateKey]);

  useEffect(() => {
    return listen("pick_random", () => {
      if (items.length <= 1) return;

      let id = selectedId;
      while (id == selectedId) {
        id = sample(items).id;
      }
      onSelect(id);
    });
  }, [items, selectedId]);

  useEffect(() => {
    return listen("completed", async (id, elapsed) => {
      const item = find(items, { id });
      if (item) {
        const db = await getDB();
        item.testCount = get(item, "testCount", 0) + 1;
        item.elapsed = get(item, "elapsed", 0) + elapsed;
        await db.update(item);
      }
    });
  }, [items]);

  return (
    <aside
      className={cx(
        "fixed left-0 top-0 bottom-0 w-[320px] bg-gray-950 z-10 transition",
        sidebarOpen
          ? "opacity-100 pointer-events-auto translate-x-0"
          : "opacity-0 pointer-events-none -translate-x-5"
      )}
      onClick={stopPropagation}
    >
      {/* Create new */}
      <div className="flex justify-end p-1">
        <button className="text-white p-2 rounded" onClick={createNew}>
          {IconAdd}
        </button>
      </div>
      <div className="absolute top-12 left-0 right-0 bottom-0 overflow-x-hidden overflow-y-auto">
        {map(items, (item) => (
          <div
            key={item.id}
            className="text-white p-2 cursor-pointer flex justify-between items-center"
          >
            <span
              onClick={(e) => onSelectionChange(e, item.id)}
              className="whitespace-pre text-ellipsis overflow-hidden px-2 flex-grow"
            >
              {item.title}
            </span>
            <button
              className={cx(
                "text-white pr-1",
                allowEdit ? "" : "text-opacity-15"
              )}
              onClick={() => editItem(item.id)}
              disabled={!allowEdit}
            >
              {IconEdit}
            </button>
          </div>
        ))}
      </div>
      <Popup
        onSaveSuccess={onSaveSuccess}
        closeModal={closeModal}
        selectedId={editId}
      />
    </aside>
  );
}
