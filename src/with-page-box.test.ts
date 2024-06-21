import test from "ava";
import { withPageBox } from "./with-page-box";
import { ContentApi } from "./ContentApi";

const api = new ContentApi();

test("box default", async (t) => {
  const fn = withPageBox({ api, filter: { status: "public" } });
  const context = {
    params: {},
    res: {
      setHeader: () => {},
    },
  };
  const result = await fn()(context as any);
  const box = (result as any).props.box;

  // Check length
  t.is(box.results.length, 20);

  // No private content
  t.is(box.results.filter((c: any) => c.status == "private").length, 0);
});

test("sql", async (t) => {
  const fn = withPageBox({
    api,
    filter: { categories: ["sql"], include_data: false },
  });
  const context = {
    params: {},
    res: {
      setHeader: () => {},
    },
  };
  const result = await fn()(context as any);
  const box = (result as any).props.box;
  console.log(box);

  // Check length
  t.is(box.results.length, 6);

  // No private content
  t.is(
    box.results
      .filter((c: any) => c.categories.includes("sql"))
      .filter((e: any) => e).length,
    6
  );
});
