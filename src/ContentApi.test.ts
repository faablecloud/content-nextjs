import test from "ava";
import { ContentApi } from "./ContentApi.js";

test("box default", async (t) => {
  const api = ContentApi.create();

  const contents = await api.list().all();

  t.is(contents.length, 57);
  console.log(contents);
});
