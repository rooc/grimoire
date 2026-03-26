import {
  useState,
  useCallback,
  useRef,
  type ReactElement,
  type ComponentType,
  type RefObject,
} from "react";
import type {
  SuggestionOptions,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { SuggestionPopover } from "../SuggestionPopover";

/** Handle interface that suggestion list components must expose via forwardRef */
export interface SuggestionListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/** Props that suggestion list components receive */
export interface SuggestionListProps<T> {
  items: T[];
  command: (item: T) => void;
  onClose?: () => void;
}

interface SuggestionState<T> {
  items: T[];
  command: (item: T) => void;
  clientRect: (() => DOMRect | null) | null;
}

interface UseSuggestionRendererOptions {
  /** Floating-ui placement for the popover */
  placement?: "bottom-start" | "top-start";
  /** Called when Ctrl/Cmd+Enter is pressed while suggestion is open */
  onModEnter?: () => void;
}

/**
 * Hook that bridges Tiptap's suggestion render callbacks to React state
 *
 * Returns:
 * - `render`: A stable function compatible with Tiptap's suggestion.render option
 * - `portal`: A ReactElement to include in the component tree (renders via portal)
 *
 * The render function is stable (never changes reference) so it's safe to use
 * as a useMemo dependency for extension configuration.
 */
export function useSuggestionRenderer<T>(
  Component: ComponentType<
    SuggestionListProps<T> & { ref?: RefObject<SuggestionListHandle | null> }
  >,
  options?: UseSuggestionRendererOptions,
): {
  render: () => ReturnType<NonNullable<SuggestionOptions["render"]>>;
  portal: ReactElement | null;
} {
  const [state, setState] = useState<SuggestionState<T> | null>(null);
  const componentRef = useRef<SuggestionListHandle>(null);
  const onModEnterRef = useRef(options?.onModEnter);
  onModEnterRef.current = options?.onModEnter;

  // Track whether a suggestion session is currently active.
  // Guards against stale onUpdate calls that arrive after onExit fires
  // (e.g. async items() resolving after the suggestion was dismissed).
  const isActiveRef = useRef(false);

  // Stable render factory — uses setState which is guaranteed stable by React
  const render = useCallback(
    (): ReturnType<NonNullable<SuggestionOptions["render"]>> => ({
      onStart: (props) => {
        isActiveRef.current = true;
        setState({
          items: props.items as T[],
          command: props.command as (item: T) => void,
          clientRect: props.clientRect as (() => DOMRect | null) | null,
        });
      },

      onUpdate: (props) => {
        // Ignore updates that arrive after the suggestion session ended.
        // This prevents "No profiles found" from reappearing after autocomplete.
        if (!isActiveRef.current) return;
        setState({
          items: props.items as T[],
          command: props.command as (item: T) => void,
          clientRect: props.clientRect as (() => DOMRect | null) | null,
        });
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "Escape") {
          setState(null);
          return true;
        }

        // Ctrl/Cmd+Enter submits the message even when suggestion is open
        if (
          props.event.key === "Enter" &&
          (props.event.ctrlKey || props.event.metaKey)
        ) {
          setState(null);
          onModEnterRef.current?.();
          return true;
        }

        return componentRef.current?.onKeyDown(props.event) ?? false;
      },

      onExit: () => {
        isActiveRef.current = false;
        setState(null);
      },
    }),
    [],
  );

  const placement = options?.placement ?? "bottom-start";

  // Only render the portal when there are items to show.
  // When items is empty the popup is hidden — this prevents a "No results found"
  // message from flashing briefly when Tiptap fires onUpdate([]) just before onExit.
  const portal =
    state && state.items.length > 0 ? (
      <SuggestionPopover clientRect={state.clientRect} placement={placement}>
        <Component
          ref={componentRef}
          items={state.items}
          command={state.command}
          onClose={() => setState(null)}
        />
      </SuggestionPopover>
    ) : null;

  return { render, portal };
}
