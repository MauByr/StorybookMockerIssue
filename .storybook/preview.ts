import type { Preview } from "@storybook/react-vite";
import { sb } from "storybook/test";

sb.mock(import("../src/module.ts"), { spy: true });

const preview: Preview = {};

export default preview;
