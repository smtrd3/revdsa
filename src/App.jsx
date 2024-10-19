import { Badge, Theme } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";
import { Aside } from "./Aside";
import { Stats } from "./Stats";
import { StatsContent } from "./StatsContent";
import { TypingPad } from "./TypingPad";
import { getDB } from "./database";
import { listen } from "./events";
import { IconBack, IconKeyboard, IconSidebar } from "./icons";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [item, setItem] = useState(null);
  const [typingState, setTypingState] = useState({});

  const toggleSidebar = useCallback((e) => {
    e.stopPropagation();
    setSidebarOpen((open) => !open);
  }, []);

  const loadCode = useCallback(async () => {
    if (selectedId) {
      const db = await getDB();
      const item = await db.get(selectedId);
      setItem(item);
    } else {
      setItem(null);
    }
  }, [selectedId]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  useEffect(() => {
    function close() {
      setSidebarOpen((open) => (open ? false : open));
    }

    document.addEventListener("click", close);

    return () => {
      document.removeEventListener("click", close);
    };
  }, []);

  useEffect(() => {
    return listen("deleted", (id) => {
      if (id === selectedId) {
        setSelectedId(null);
      }
    });
  }, [selectedId]);

  useEffect(() => {
    return listen("updated", (id) => {
      if (id === selectedId) {
        loadCode();
      }
    });
  }, [selectedId, loadCode]);

  return (
    <Theme hasBackground={false} appearance="dark">
      {/* Page content */}
      <div className="w-full flex items-center flex-col text-white font-sans">
        {item && (
          <h1 className="flex items-center mt-4 w-[800px] text-2xl gap-4">
            <button className="text-white" onClick={() => setSelectedId(null)}>
              {IconBack}
            </button>
            <span>{item.title}</span>
            {typingState.started && (
              <Badge color="green" className="font-bold">
                RUNNING
              </Badge>
            )}
            {typingState.completed && (
              <Badge color="purple" className="font-bold">
                COMPLETE
              </Badge>
            )}
          </h1>
        )}
        {item && (
          <div className="mt-8">
            <TypingPad
              id={item.id}
              snippet={item.code}
              onStateChange={setTypingState}
            />
          </div>
        )}
        {!item && (
          <div className="flex justify-center items-center flex-col mb-4">
            {IconKeyboard}
            <h1 className="text-2xl">Rev-DSA</h1>
            <p className="italic text-white text-opacity-50">
              Recharge Your DSA Knowledge, One Template at a Time
            </p>

            <div className="mt-8 w-[800px] border border-solid border-gray-600 p-4 rounded">
              <StatsContent />
            </div>
          </div>
        )}
      </div>
      {/* Side bar */}
      <Aside
        sidebarOpen={sidebarOpen}
        onSelect={setSelectedId}
        selectedId={selectedId}
        toggleSidebar={toggleSidebar}
        allowEdit={!typingState.started}
      />
      {/* Toggle sidebar action */}
      <button
        className="text-white fixed left-1 top-1 bg-gray-950 p-2 rounded z-50"
        onClick={toggleSidebar}
      >
        {IconSidebar}
      </button>
      <Stats />
    </Theme>
  );
}

export default App;
