import { useCallback, useMemo, useRef } from "react";

export const useDynamicNode = () => {
  const dynamicNodeRef = useRef<HTMLDivElement | null>(null);

  const destroyNode = useCallback(() => {
    dynamicNodeRef.current?.remove();
    dynamicNodeRef.current = null;
  }, []);

  const getDynamicNode = useCallback(() => {
    if (!dynamicNodeRef.current) {
      dynamicNodeRef.current = document.createElement("div");
      dynamicNodeRef.current.setAttribute("id", window.crypto.randomUUID());
      document.body.appendChild(dynamicNodeRef.current);
      return dynamicNodeRef.current;
    }
    return dynamicNodeRef.current;
  }, []);

  return useMemo(
    () => ({
      getDynamicNode,
      destroyNode,
    }),
    [destroyNode, getDynamicNode]
  );
};
