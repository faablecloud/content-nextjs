import { withPageContent } from "@faable/content-nextjs";
import { GetServerSideProps } from "next";
import Link from "next/link";

const Page = (props) => {
  const { content, box, other } = props;
  return (
    <div>
      <h1>Content</h1>
      <div>
        <b>Title:</b> {content.title}
      </div>
      <div>
        <b>Authors:</b> {content.authors.join(",")}
      </div>

      {/* <div>
        <h2>Context</h2>
        <ul>
          {box.results.map((e) => (
            <li key={e.id}>
              {e.title} · <Link href={`/blog/${e.slug}`}>Entry</Link> ·{" "}
              <Link href={`/context/${e.slug}`}>Context</Link>
            </li>
          ))}
        </ul>
      </div> */}

      <div style={{ marginTop: 20 }}>
        <Link href="/">Go to list</Link>
      </div>
    </div>
  );
};

const ss_props: GetServerSideProps = async () => {
  return { props: { other: "yes" } };
};

export const getServerSideProps = withPageContent({})(ss_props);

export default Page;
