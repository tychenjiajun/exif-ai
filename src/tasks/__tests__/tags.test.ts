import { describe, it, expect } from "vitest";

const buffer = Buffer.from("test");
const model = "testModel";
const prompt = "testPrompt";
const providerModule = {
  getTags: () => Promise.resolve(["tag1", "tag2"]),
};
const providerArgs = ["testProviderArgs"];
const verbose = true;
const tagTags = ["Subject", "Keywords"] as const;
const existingTags = {
  Subject: ["existingSubject"],
  Keywords: ["existingKeywords"],
};
const path = "testPath";

const baseOptions = {
  buffer,
  model,
  prompt,
  providerModule,
  providerArgs,
  verbose,
  tagTags,
  existingTags,
  path,
};

import { getTags } from "../tags.js";

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
      getTags: () => Promise.resolve(undefined),
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
      getTags: () => Promise.resolve([]),
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
      getTags: () => Promise.reject(new Error("Error in getTags")),
    };

    const result = await getTags({
      ...baseOptions,
      providerModule,
    });

    expect(result).to.deep.equal({});
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
    {
      a: `
       The image depicts a scene at an airport runway, with the following visible elements:

- An airplane parked on the tarmac.
- A yellow vehicle (likely a baggage loader or aircraft tug) pulling away from the plane.
- An airport worker standing on the wing of the plane, using a cherry picker to access the roof.
- The runway itself is wet, suggesting recent rainfall.
- In the background, there is another aircraft parked.
- The sky appears cloudy and overcast.

Given these elements, here are some possible tags based on subject, object, event, place:

<tag1>, airport, runway, jet, aircraft, <tag2>, worker, cherry picker, maintenance, repair, <tag3>, rainy day, wet tarmac, <tag4>, loading luggage, ground support vehicle, <tag5>, aviation, passenger plane, <tag6>, safety equipment, harness, <tag7>, runway operations, <tag8>, airport staff, <tag9>, cloudy weather, overcast sky, <tag10> , passenger aircraft.`,
      expected: [
        "airport",
        "runway",
        "jet",
        "aircraft",
        "worker",
        "cherry picker",
        "maintenance",
        "repair",
        "rainy day",
        "wet tarmac",
        "loading luggage",
        "aviation",
        "passenger plane",
        "safety equipment",
        "harness",
        "runway operations",
        "airport staff",
        "cloudy weather",
        "overcast sky",
        "passenger aircraft",
      ],
    },
    {
      a: `
       <tag1>展览馆</tag1>

<tag2>人群观看展品</tag2>

<tag3>文物或展品</tag3>

<tag4>门户到外面的大门</tag4>

<tag5>内部照明设施</tag5>

<tag6>墙壁上的展品信息匾</tag6>

<tag7>观客手提包装</tag7>

<tag8>门户或展览场景下方的玄天花板</tag8>

<tag9>建筑体系中的通道</tag9>

<tag10>墙壁上的文本信息</tag10>

<tag11>展览的主题（如历史、艺术、科学等）</tag11>

<tag12>门口外部照明灯</tag12>

<tag13>展览门口安保设施</tag13>

<tag14>门口的窗帘</tag14>

<tag15>外部的街道、建筑周围环境</tag15>`,
      expected: [
        "展览馆",
        "人群观看展品",
        "文物或展品",
        "门户到外面的大门",
        "内部照明设施",
        "墙壁上的展品信息匾",
        "观客手提包装",
        "门户或展览场景下方的玄天花板",
        "建筑体系中的通道",
        "墙壁上的文本信息",
        "展览的主题（如历史、艺术、科学等）",
        "门口外部照明灯",
        "展览门口安保设施",
        "门口的窗帘",
      ],
    },
    {
      a: `
       以下是根据主题、对象、事件、场所来定义的标签：

1. 天氣幽阳
2. 游客聚集
3. 露台陶膜食堂
4. 旅游景区
5. 群众聚集在山前景点
6. 人群浩多的席子
7. 夜间活动场所
8. 游乐设施周边
9. 商业区域
10. 露台陶膜餐厅
11. 山前景点景色
12. 多彩的露台
13. 聚集在露台下
14. 夜晚游乐设施周边
15. 露台周围景观`,
      expected: [
        "天氣幽阳",
        "游客聚集",
        "露台陶膜食堂",
        "旅游景区",
        "群众聚集在山前景点",
        "人群浩多的席子",
        "夜间活动场所",
        "游乐设施周边",
        "商业区域",
        "露台陶膜餐厅",
        "山前景点景色",
        "多彩的露台",
        "聚集在露台下",
        "夜晚游乐设施周边",
      ],
    },
    {
      a: `
       根据这张图片的主题、主要对象、事件、地点等元素，以下是中文标签：

1. <星空>
2. <天文>
3. <夜晚>
4. <山脉>
5. <无人区域>
6. <探测器>
7. <自然景观>
8. <科学探索>
9. <技术成就>
10. <宇宙探索>`,
      expected: [
        "星空",
        "天文",
        "夜晚",
        "山脉",
        "无人区域",
        "探测器",
        "自然景观",
        "科学探索",
        "技术成就",
      ],
    },
    { a: '["a","b"]', expected: ["a", "b"] },
  ])("should format ($a) -> $expected", async ({ a, expected }) => {
    const providerModule = {
      getTags: () => Promise.resolve(a),
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
