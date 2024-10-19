import { useCallback, useEffect, useRef, useState } from "react";
import { runCompleteAnimation } from "./confetti";
import { dispatch } from "./events";
import { Button } from "@radix-ui/themes";
import cx from "classnames";
import { EyeClose, EyeOpen } from "./icons";

let timerId = 0;

export function TypingPad(props) {
  const {
    id,
    width = 800,
    height = 300,
    fontSize = 14,
    snippet = "nothing set",
    onStateChange,
  } = props;
  const textarea = useRef();
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const append = useCallback(
    (content) => {
      setTyped((typed) => {
        let nextLine = typed + content;
        if (content === "  ") {
          const skipped = snippet.slice(nextLine.length);
          const matchedStartingWhitespace = skipped.match(/^[ ]+/);
          if (matchedStartingWhitespace) {
            nextLine += matchedStartingWhitespace[0];
          }
        }

        if (nextLine === snippet) {
          setCompleted(true);
        }

        return snippet.startsWith(nextLine) ? nextLine : typed;
      });
    },
    [snippet, id]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (completed) {
        e.preventDefault();
        return;
      }

      // Start test on input
      setStarted((started) => (started ? started : true));

      if (e.code == "Tab") {
        e.preventDefault();
        append("  ");
      } else if (e.code === "Backspace") {
        e.preventDefault();
        setTyped((typed) => typed.slice(0, -1));
      } else if (e.code === "Enter") {
        append("\n");
      } else if (e.key.length === 1) {
        append(e.key);
      } else {
        e.preventDefault();
      }
    },
    [append, completed]
  );

  const reset = useCallback(() => {
    setTyped("");
    setElapsed(0);
    setStarted(false);
    setCompleted(false);
    if (timerId) {
      clearInterval(timerId);
    }
  }, []);

  const startTest = useCallback(() => {
    return setInterval(() => {
      setElapsed((curr) => curr + 500);
    }, 500);
  }, []);

  const onReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const onUnreveal = useCallback(() => {
    setRevealed(false);
    textarea.current?.focus();
  }, [textarea]);

  useEffect(() => {
    reset();
  }, [id]);

  useEffect(() => {
    if (started) {
      timerId = startTest();
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [started]);

  useEffect(() => {
    if (completed) {
      runCompleteAnimation();
      clearInterval(timerId);
      setStarted(false);
      dispatch("completed", id, elapsed);
    }
  }, [completed, elapsed]);

  useEffect(() => {
    onStateChange?.({ started, completed });
  }, [started, completed]);

  useEffect(() => {
    setTyped("");
  }, [snippet]);

  const minutes = elapsed / 1000 / 60;
  const cmp = minutes === 0 ? "0.00" : (typed.length / minutes).toFixed(2);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-8 font-sans font-size py-4">
          <div className="flex gap-2">
            <span className="">Speed:</span>
            <span className="font-bold text-lime-300">{cmp} CPM</span>
          </div>
          <div className="flex gap-2">
            <span className="">Time:</span>
            <span className="font-bold text-lime-300">
              {minutes.toFixed(2)} MIN
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          {started && (
            <Button
              variant="soft"
              color="cyan"
              className="cursor-pointer"
              onMouseDown={onReveal}
              onMouseUp={onUnreveal}
              onMouseLeave={onUnreveal}
            >
              {revealed && EyeOpen}
              {!revealed && EyeClose}
            </Button>
          )}
          <Button onClick={() => dispatch("pick_random")} variant="soft">
            RANDOM
          </Button>
          <Button onClick={reset} variant="soft">
            RESET
          </Button>
        </div>
      </div>
      <div
        className="grid grid-cols-1 grid-rows-1 border-2 border-emerald-400 border-solid p-2 rounded"
        style={{ minWidth: width, minHeight: height }}
      >
        <textarea
          className="row-start-1 col-start-1 bg-transparent leading-normal overflow-hidden resize-none whitespace-pre outline-none font-sans text-white caret-teal-300 select-none"
          onKeyDown={onKeyDown}
          value={typed}
          spellCheck={false}
          style={{ fontSize }}
          onChange={(e) => e.preventDefault()}
          ref={textarea}
        />
        <div
          className={cx(
            "row-start-1 col-start-1 leading-normal overflow-hidden text-opacity-50 whitespace-pre pointer-events-none font-sans text-white caret-lime-400",
            revealed === false && started && "blur-sm"
          )}
          style={{ fontSize }}
        >
          {snippet}
        </div>
      </div>
    </div>
  );
}
