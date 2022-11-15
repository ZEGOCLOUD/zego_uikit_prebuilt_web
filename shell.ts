import { readFileSync, writeFileSync } from "fs";

let code = readFileSync(
  "./src/sdk/view/pages/ZegoRoom/components/ZegoWhiteboardTools.tsx"
).toString();

const result = code.replace(/style="(.+)"\s+/gi, (styleValue: string) => {
  const content = styleValue.split('"')[1];
  let style = "";
  content &&
    content.split(";").forEach((res) => {
      style += `"${res.split(":")[0].trim()}":"${res.split(":")[1].trim()}",`;
    });
  console.log(style);
  return `style={{${style}}}`;
});
console.log(result);

writeFileSync(
  "./src/sdk/view/pages/ZegoRoom/components/ZegoWhiteboardToolsTarget.tsx",
  result,
  { encoding: "utf-8" }
);
