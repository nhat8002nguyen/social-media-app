import { useEffect, useRef, useState } from "react";

export const useOutsideClick = (ref: ReturnType<typeof useRef<HTMLDivElement>>) => {
  const [visible, setVisible] = useState<boolean>(false);

  const handleOutsideClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setVisible(false);
			const searchInputNode = ref.current.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;
			if (searchInputNode[0]) {
				searchInputNode[0].value = "";
			}
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [ref]);

  return { visible, setVisible };
};
