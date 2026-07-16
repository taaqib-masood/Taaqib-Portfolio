import { CreateUIMessage, UIMessage } from "ai";

const m: CreateUIMessage<UIMessage> = {
  role: "user",
  parts: [{ type: "text", text: "hello" }]
};
