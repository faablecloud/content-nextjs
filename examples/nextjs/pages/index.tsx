import { withPageBox } from "@core-school/next-content";
import { GetServerSideProps } from "next";
import { kit } from "../lib/kit";
import Link from "next/link";

const Page = (props) => {
  const { box, other } = props;
  console.log(props);
  return (
    <div>
      <h1>Content List</h1>
      <ul>
        {box.results.map((e) => (
          <li key={e.id}>
            {e.title} · <Link href={`/blog/${e.slug}`}>Entry</Link> ·{" "}
            <Link href={`/context/${e.slug}`}>Context</Link>
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
  kit,
})(ss_props);

export default Page;
