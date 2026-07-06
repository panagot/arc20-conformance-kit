import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · ARC-20 Kit`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
