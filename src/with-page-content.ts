import { GetServerSideProps } from "next";
import { AxiosError } from "axios";
import { ContentApi } from "./ContentApi";
import Keyv from "@keyvhq/core";

export type WithPageContentConfig = {
  api?: ContentApi;
  box?: string;
  maxAge?: number;
  disableCache?: boolean;
  staleWhileRevalidate?: number;
};

export const withPageContent = (config: WithPageContentConfig = {}) => {
  let api: ContentApi = config.api as any;
  if (!api) {
    api = new ContentApi({ box: config.box });
  }

  const cache = new Keyv();

  return (
      getServerSideProps?: GetServerSideProps
    ): GetServerSideProps<any, { slug: string }> =>
    async (ctx) => {
      // Server side props wrapped
      let ret: any = { props: {} };
      if (getServerSideProps) {
        ret = await getServerSideProps(ctx);
      }

      let {
        maxAge = 3600,
        staleWhileRevalidate = 3600,
        disableCache = false,
      } = config;

      const slug = ctx.params?.slug;
      if (!slug) {
        throw new Error("Missing slug query parameter");
      }

      // If draft param is specified, disable cache
      const draft = ctx.query.draft;
      if (draft) {
        disableCache = true;
      }

      try {
        const content = await api.get(slug);

        // Disable cache if post is private
        if (content.status == "private") {
          disableCache = true;
        }

        // Return 404 if post is private and draft parameter is not set
        if (content.status == "private" && !draft) {
          return {
            notFound: true,
          };
        }

        ret.props = { ...ret.props, content };

        if (!disableCache) {
          ctx.res.setHeader(
            "Cache-Control",
            `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, must-revalidate`
          );
        }
        return ret;
      } catch (error) {
        const e: AxiosError = error as any;
        if (e.response?.status == 404) {
          return {
            notFound: true,
          };
        }
        throw e;
      }
    };
};
