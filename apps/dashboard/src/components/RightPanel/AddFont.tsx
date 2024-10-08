import { Popover, Button, TextField, Flex, Badge } from "@radix-ui/themes";
import Fuse from "fuse.js";
import { useFontsStore } from "../../stores/fontsStore";
import { useElementsStore } from "../../stores/elementsStore";
import { useEffect, useMemo, useState } from "react";
import { FontPreview } from "../FontPreview";
import { OGElement } from "../../lib/types";

export function AddFont({
  selectedElement,
}: {
  selectedElement: OGElement & { tag: "p" | "span" };
}) {
  const { allFonts, installedFonts, installFont } = useFontsStore();

  const updateElement = useElementsStore((state) => state.updateElement);

  const fuse = useMemo(
    () => new Fuse(allFonts, { keys: ["name"] }),
    [allFonts],
  );
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const searchedFonts = fuse
    .search(debouncedSearch)
    .slice(0, 5)
    .map(({ item }) => item.name);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button size="2" variant="soft" color="gray">
          +
        </Button>
      </Popover.Trigger>
      <Popover.Content width="300px">
        <Flex gap="3" direction="column">
          <TextField.Root
            placeholder="Search fontsource fonts"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          {searchedFonts.map((font) => (
            <Button
              variant="soft"
              color="gray"
              key={font}
              onClick={() => {
                installFont(font);

                const weights = allFonts.find((f) => f.name === font)?.weights;

                updateElement({
                  ...selectedElement,
                  fontFamily: font,
                  fontWeight: weights?.includes(selectedElement.fontWeight)
                    ? selectedElement.fontWeight
                    : 400,
                });

                setOpen(false);
              }}
            >
              <FontPreview font={font} />

              {installedFonts.has(font) ? (
                <Badge color="green">Installed</Badge>
              ) : null}
            </Button>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

// source: https://github.com/uidotdev/usehooks/blob/90fbbb4cc085e74e50c36a62a5759a40c62bb98e/index.js#L239
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
