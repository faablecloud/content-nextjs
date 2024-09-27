import { GetServerSideProps } from "next";
import Link from "next/link";
import { content_client } from "../../lib/content";

const Page = (props) => {
  const { data, other } = props;
  return (
    <div>
      <h1>Content</h1>
      <div>
        <b>Title:</b> {data.title}
      </div>
      <div>
        <b>Authors:</b> {data.authors.join(",")}
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { data } = await content_client.getContent(query.slug as string);
  return { props: { other: "yes", data }, notFound: !data };
};

export default Page;
