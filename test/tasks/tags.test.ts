import { describe, it, expect } from "vitest";

const buffer = Buffer.from("test");
const model = "testModel";
const prompt = "testPrompt";
const providerModule = {
  getTags: async () => ["tag1", "tag2"],
};
const providerArgs = ["testProviderArgs"];
const verbose = true;
const tagTags = ["Subject", "Keywords"] as const;
const existingTags = {
  Subject: ["existingSubject"],
  Keywords: ["existingKeywords"],
};

const baseOptions = {
  buffer,
  model,
  prompt,
  providerModule,
  providerArgs,
  verbose,
  tagTags,
  existingTags,
};

import { getTags } from "../../src/tasks/tags.js";

describe("Tag Tests", () => {
  it("should run correctly", async () => {
    const result = await getTags(baseOptions);

    expect(result).to.deep.equal({
      Subject: ["existingSubject", "tag1", "tag2"],
      Keywords: ["existingKeywords", "tag1", "tag2"],
    });
  });

  it("should return empty object if tags are undefined", async () => {
    const providerModule = {
      getTags: async () => undefined,
    };

    const result = await getTags({
      ...baseOptions,
      providerModule,
    });

    expect(result).to.deep.equal({});
  });

  it("should handle empty tagTags array", async () => {
    const tagTags = [] as const;

    const result = await getTags({
      ...baseOptions,
      tagTags,
    });

    expect(result).to.deep.equal({});
  });

  it("should handle empty existingTags object", async () => {
    const existingTags = {} as const;

    const result = await getTags({
      ...baseOptions,
      existingTags,
    });

    expect(result).to.deep.equal({
      Subject: ["tag1", "tag2"],
      Keywords: ["tag1", "tag2"],
    });
  });

  it("should handle providerModule.getTags returning an empty array", async () => {
    const providerModule = {
      getTags: async () => [],
    };

    const result = await getTags({
      ...baseOptions,
      providerModule,
    });

    expect(result).to.deep.equal({});
  });

  it("should handle no existing tags", async () => {
    const result = await getTags({
      ...baseOptions,
      existingTags: undefined,
    });

    expect(result).to.deep.equal({
      Subject: ["tag1", "tag2"],
      Keywords: ["tag1", "tag2"],
    });
  });

  it("should handle string existing tags", async () => {
    const result = await getTags({
      ...baseOptions,
      existingTags: {
        Keywords: "existingSubject",
      },
    });

    expect(result).to.deep.equal({
      Subject: ["tag1", "tag2"],
      Keywords: ["tag1", "tag2", "existingSubject"],
    });
  });

  it("should handle providerModule.getTags throwing an error", async () => {
    const providerModule = {
      getTags: async () => {
        throw new Error("Error in getTags");
      },
    };

    const result = await getTags({
      ...baseOptions,
      providerModule,
    });

    expect(result).to.deep.equal(undefined);
  });

  it.each([
    { a: "1", expected: ["1"] },
    {
      a: "1,2",
      expected: ["1", "2"],
    },
    {
      a: "ids, names, locations, dates, times, weathers",
      expected: ["ids", "names", "locations", "dates", "times", "weathers"],
    },
    {
      a: "The image shows a night sky filled with stars, with the milky way visible. In the foreground, there is a satellite dish or antenna pointing towards the sky. The landscape appears to be a hilly or mountainous area. There are no texts or human figures in the image that would require specific tags. If you need generic tags for this kind of scene (e.g., night sky, stars, satellite dish, mountains), please let me know!",
      expected: ["night sky", "stars", "satellite dish", "mountains"],
    },
    {
      a: "<人群>, <红色帐篷>, <白色文字>, <黄色旗帜>, <大树>, <保安>",
      expected: ["人群", "红色帐篷", "白色文字", "黄色旗帜", "大树", "保安"],
    },
    {
      a: "<2024>, <广交会>, <世界互利天下>, <花坛>, <喷泉>, <绿色植物>, <红色花朵>, <白色字体>, <红色字体>, <绿色墙壁>, <白色天花板>, <灯光>, <木地板>, <玻璃窗>, <空调外机>, <监控摄像头>",
      expected: [
        "2024",
        "广交会",
        "世界互利天下",
        "花坛",
        "喷泉",
        "绿色植物",
        "红色花朵",
        "白色字体",
        "红色字体",
        "绿色墙壁",
        "白色天花板",
        "灯光",
        "木地板",
        "玻璃窗",
        "空调外机",
        "监控摄像头",
      ],
    },
  ])("should format ($a) -> $expected", async ({ a, expected }) => {
    const providerModule = {
      getTags: async () => a,
    };

    const result = await getTags({
      ...baseOptions,
      providerModule,
    });

    expect(result).to.deep.equal({
      Subject: ["existingSubject"].concat(expected),
      Keywords: ["existingKeywords"].concat(expected),
    });
  });
});
