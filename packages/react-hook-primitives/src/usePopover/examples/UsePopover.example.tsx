import { usePopover } from "../usePopover.js";

export default () => {
  const { setPopoverRef, setTargetRef, showPopover, hidePopover } = usePopover({
    id: "use-popover",
  });

  return (
    <>
      <button type="button" ref={setTargetRef} onClick={showPopover}>
        Open Popover
      </button>
      <article
        ref={setPopoverRef}
        style={{
          border: "1px solid red",
        }}
      >
        this is some popover content
        <button type="button" onClick={hidePopover}>
          Close Popover
        </button>
      </article>
    </>
  );
};
