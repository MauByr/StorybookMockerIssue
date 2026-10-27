import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { fn, Thing } from "./module";

const meta = { title: "SpyMock" } satisfies Meta;

export default meta;

export const ArrayPropertyOnFunction: StoryObj = {
    render: () => <p>list: [{fn.list.join(", ")}]</p>,
    play: async ({ canvas }) => {
        await expect(canvas.getByText("list: [a, b]")).toBeInTheDocument();
    },
};

export const ClassConstructor: StoryObj = {
    render: () => <p>value: {new Thing(1).value}</p>,
    play: async ({ canvas }) => {
        await expect(canvas.getByText("value: 1")).toBeInTheDocument();
    },
};
