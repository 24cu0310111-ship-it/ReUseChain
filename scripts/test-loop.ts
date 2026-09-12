import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

const TestState = Annotation.Root({
  count: Annotation<number>,
  status: Annotation<string>,
});

const builder = new StateGraph(TestState)
  .addNode("step1", (s) => {
    console.log("Executing step1, count =", s.count);
    return { count: s.count + 1 };
  })
  .addNode("step2", (s) => {
    console.log("Executing step2");
    return { status: "completed" };
  })
  .addEdge(START, "step1")
  .addConditionalEdges("step1", (s) => (s.count < 3 ? "step1" : "step2"))
  .addEdge("step2", END);

async function main() {
  const app = builder.compile();
  const res = await app.invoke({ count: 0, status: "start" });
  console.log("Final Loop Result:", JSON.stringify(res));
}

main().catch(console.error);
