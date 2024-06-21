import test from "ava";
import { ContentApi } from "./ContentApi";

test("box default", async (t) => {
  const api = new ContentApi();

  const contents = await api.list().all();

  t.is(contents.length, 57);
  console.log(contents);
});
