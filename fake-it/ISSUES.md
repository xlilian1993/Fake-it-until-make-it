# Fake It 当前问题分析

## 问题：LLM 返回结构不完整

**现象**：`/api/recommend` 调用 DeepSeek 后，返回 `{"characterName":"","viewpoint":"...","story":"..."}` 单角色格式，而非预期的 `{"characters":[{...}]}` 数组格式。

**排查过程**：

1. `extractJSON` 函数本身没问题——能正确解析 LLM 返回的 JSON 字符串
2. `buildRecommendPrompt` 返回的 prompt 包含了完整的 5 角色模板和 `{"characters":[` 开头指令
3. 但 DeepSeek 仍然返回了单角色格式（与 `buildRoundTablePrompt` 的格式相似）

**可能原因**：

- DeepSeek chat 模型对不同 prompt 的上下文混淆
- 两个 prompt（`buildRecommendPrompt` 和 `buildRoundTablePrompt`）都使用了类似的结构，LLM 可能混用了格式
- `buildRecommendPrompt` 的 prompt 虽然指定了 5 角色模板，但模板中的 `{},{},{}` 占位符可能让 LLM 困惑

**建议修复方向**：

1. 在 prompt 末尾用 `ASSISTANT:` 前缀引导 LLM 直接输出 `{"characters":[`
2. 或者改用 `response_format: { type: "json_object" }` 参数（DeepSeek 支持）
3. 或者在 `llm.ts` 的 `callLLM` 中给 messages 添加 system message 约束角色

## 已完成的修改（待 push）

- `prompts.ts`：强化 `buildRecommendPrompt`，增加模板示例，要求第一行必须是 `{"characters":[`
- 其他远端拉取的修改已合并