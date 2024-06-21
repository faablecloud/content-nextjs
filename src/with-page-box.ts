import { GetServerSideProps } from "next";
import { AxiosError } from "axios";
import { ContentApi, ContentListQueryParams } from "./ContentApi";

export type WithPageBoxConfig = {
  api?: ContentApi;
  box?: string;
  filter?: ContentListQueryParams;
};

export const withPageBox = (config: WithPageBoxConfig) => {
  let api: ContentApi = config.api as any;
  if (!api) {
    api = new ContentApi({ box: config.box });
  }

  return (getServerSideProps?: GetServerSideProps): GetServerSideProps =>
    async (ctx) => {
      // Server side props wrapped
      let ret: any = { props: {} };
      if (getServerSideProps) {
        ret = await getServerSideProps(ctx);
      }

      // Check if we are in a post context
      const context_content_id = ret.props?.content?.id;
      if (context_content_id) {
        console.log(`Context enabled with content_id=${context_content_id}`);
      }

      // Fetch the list with context
      try {
        const page = await api.list(config.filter).all();

        // 1 hour in client
        // 24 hour in Fastly
        // Revalidate every 2 hours
        ctx.res.setHeader(
          "Cache-Control",
          "public, s-maxage=3600, stale-while-revalidate=1800"
        );
        return {
          ...ret,
          props: {
            ...ret.props,
            box: page,
          },
        };
      } catch (error) {
        const e: AxiosError = error as any;
        if (e.response?.status == 404) {
          console.log(e.response.data);
          return {
            notFound: true,
          };
        }
        throw e;
      }
    };
};
