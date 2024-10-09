import Link from "next/link";
import { content_client, FAABLE_CACHE_HEADER } from "../lib/content";
import { GetServerSideProps } from "next";

const Page = (props) => {
  const { data, other } = props;

  return (
    <div>
      <h1>Content List</h1>
      <ul>
        {data.map((e) => (
          <li key={e.id}>
            <span style={{ color: e.status == "private" ? "red" : "black" }}>
              {e.title}
            </span>{" "}
            ·{" "}
            <Link
              href={`/content/${e.slug}?${new URLSearchParams(
                e.status == "private"
                  ? {
                      draft: "1",
                    }
                  : {}
              )}`}
            >
              View Content
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { cache_status, data } = await content_client.getBox("default");

  res.setHeader(FAABLE_CACHE_HEADER, cache_status);

  return { props: { other: "yes", data } };
};

export default Page;
