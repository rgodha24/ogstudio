import {
  Grid,
  Text,
  Select,
  TextField,
  Flex,
  IconButton,
  Tooltip,
} from "@radix-ui/themes";
import type { Gradient, Image, OGElement } from "../../lib/types";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StartIcon } from "../icons/StartIcon";
import { AddIcon } from "../icons/AddIcon";
import { EndIcon } from "../icons/EndIcon";
import { SquareIcon } from "../icons/SquareIcon";
import { LinkIcon } from "../icons/LinkIcon";
import { useElementsStore } from "../../stores/elementsStore";
import { ColorPicker } from "../ColorPicker";
import { useEffect, useRef } from "react";

interface ColorSelectorProps {
  selectedElement: OGElement;
}

export function ElementColorSelector({ selectedElement }: ColorSelectorProps) {
  const updateElement = useElementsStore((state) => state.updateElement);
  const selectedColorType = selectedElement.color.type;
  const prevSolidColor = useRef<string | null>(null);

  useEffect(() => {
    if (selectedColorType === "color") {
      prevSolidColor.current = selectedElement.color.color;
    }
  }, [selectedElement]);

  const canBeImage = selectedElement.tag === "div";

  const Reset = (
    <IconButton
      color="gray"
      onClick={() => {
        updateElement({
          ...selectedElement,
          color: {
            type: "color",
            color: prevSolidColor.current || "#000000",
          }
        });
      }}
      size="1"
      variant="ghost"
    >
      <DeleteIcon />
    </IconButton>
  );

  return (
    <Flex direction="column" gap="2">

      <Flex justify="between">
        <Text size="1">Background color</Text>

        {selectedColorType === "color" ? (Reset) : (
          <IconButton
            color="gray"
            onClick={() => {
              updateElement({
                ...selectedElement,
                color: {
                  type: "color",
                  color: prevSolidColor.current || "#000000",
                }
              });
            }}
            size="1"
            variant="ghost"
          >
            <AddIcon />
          </IconButton>
        )}
      </Flex>
      {selectedColorType === "color" && (
        <ColorPicker
          onChange={(backgroundColor) => {
            updateElement({
              ...selectedElement,
              color: {
                type: "color",
                color: backgroundColor,
              },
            });
          }}
          value={selectedElement.color.color}
        />
      )}

      <Flex justify="between">
        <Text size="1">Background gradient</Text>
        {selectedColorType === "gradient" ? (Reset) : (
          <IconButton
            color="gray"
            onClick={() => {
              updateElement({
                ...selectedElement,
                color: {
                  type: "gradient",
                  gradient_direction: "linear",
                  angle: 90,
                  start: "#000000",
                  end: "#FFFFFF",
                }
              });
            }}
            size="1"
            variant="ghost"
          >
            <AddIcon />
          </IconButton>
        )}
      </Flex>

      {selectedColorType === "gradient" && (
        <Grid columns="2" gap="2">
          <ColorPicker
            onChange={(start) => {
              updateElement({
                ...selectedElement,
                color: {
                  ...selectedElement.color as Gradient,
                  start,
                },
              });
            }}
            value={selectedElement.color.start}
          >
            <StartIcon />
          </ColorPicker>
          <ColorPicker
            onChange={(end) => {
              updateElement({
                ...selectedElement,
                color: {
                  ...selectedElement.color as Gradient,
                  end,
                },
              });
            }}
            value={selectedElement.color.end}
          >
            <EndIcon />
          </ColorPicker>
          <Select.Root
            onValueChange={(value: "linear" | "radial") => {
              updateElement({
                ...selectedElement,
                color: {
                  ...selectedElement.color as Gradient,
                  gradient_direction: value,
                },
              });
            }}
            value={selectedElement.color.type}
          >
            <Select.Trigger color="gray" variant="soft" />
            <Select.Content variant="soft">
              <Select.Item value="linear">Linear</Select.Item>
              <Select.Item value="radial">Radial</Select.Item>
            </Select.Content>
          </Select.Root>
          {selectedElement.color.gradient_direction === "linear" ? (
            <TextField.Root
              color="gray"
              max={360}
              min={-360}
              onChange={(event) => {
                updateElement({
                  ...selectedElement,
                  color: {
                    ...selectedElement.color as Gradient,
                    angle: event.target.valueAsNumber,
                  },
                });
              }}
              type="number"
              value={selectedElement.color.angle}
              variant="soft"
            >
              <Tooltip content="Direction">
                <TextField.Slot>
                  <SquareIcon />
                </TextField.Slot>
              </Tooltip>
              <TextField.Slot>deg</TextField.Slot>
            </TextField.Root>
          ) : null}
        </Grid>

      )}

      {canBeImage ? (
        <>
          <Flex justify="between">
            <Text size="1">Background image</Text>
            {selectedColorType === "image" ? (Reset) : (
              <IconButton
                color="gray"
                onClick={() => {
                  updateElement({
                    ...selectedElement,
                    color: {
                      type: "image",
                      src: "https://source.unsplash.com/random",
                      size: "cover",
                    }
                  });
                }}
                size="1"
                variant="ghost"
              >
                <AddIcon />
              </IconButton>
            )}
          </Flex>

          {selectedColorType === "image" && (
            <Grid columns="2" gap="2">
              <TextField.Root
                className="col-span-full"
                color="gray"
                onChange={(event) => {
                  updateElement({
                    ...selectedElement,
                    color: {
                      ...selectedElement.color as Image,
                      src: event.target.value,
                    },
                  });
                }}
                value={selectedElement.color.src}
                variant="soft"
              >
                <TextField.Slot>
                  <LinkIcon />
                </TextField.Slot>
              </TextField.Root>
              <Select.Root
                onValueChange={(value: Image["size"]) => {
                  updateElement({
                    ...selectedElement,
                    color: {
                      ...selectedElement.color as Image,
                      size: value
                    }
                  });
                }}
                value={selectedElement.color.type}
              >
                <Select.Trigger color="gray" variant="soft" />
                <Select.Content variant="soft">
                  <Select.Item value="contain">Contain</Select.Item>
                  <Select.Item value="cover">Cover</Select.Item>
                </Select.Content>
              </Select.Root>
              {/* TODO: image position */}
              {/* Needs https://github.com/vercel/satori/pull/464 */}
              {/* <Select */}
              {/*   onChange={() => { */}
              {/*     updateElement(selectedElement); */}
              {/*   }} */}
              {/*   value="center" */}
              {/*   values={["center"]} */}
              {/* > */}
              {/*   <ImagePositionIcon /> */}
              {/* </Select> */}
            </Grid>
          )}
        </>
      ) : null}
    </Flex>
  );
}
