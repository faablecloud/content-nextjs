import { withPageContent } from "@core-school/next-content";
import { GetServerSideProps } from "next";
import Link from "next/link";

const Page = (props) => {
  const { content, other } = props;

  return (
    <div>
      <h1>Content</h1>
      <div>
        <b>Title:</b> {content.title}
      </div>
      <div>
        <b>Authors:</b> {content.authors.join(",")}
      </div>
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
