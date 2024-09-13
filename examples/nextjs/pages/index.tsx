import { Content, withPageBox } from "@faable/content-nextjs";
import { GetServerSideProps } from "next";

import Link from "next/link";

const Page = (props) => {
  const { box, other } = props;

  return (
    <div>
      <h1>Content List</h1>
      <ul>
        {box.map((e) => (
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

const ss_props: GetServerSideProps = async () => {
  return { props: { other: "yes" } };
};

export const getServerSideProps = withPageBox({
  box: "default",
})(ss_props);

export default Page;
