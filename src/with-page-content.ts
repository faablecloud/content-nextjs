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

const FAABLE_CACHE_HEADER = `X-Faable-Content-Cache`;

export const withPageContent = (config: WithPageContentConfig = {}) => {
  let api: ContentApi = config.api as any;
  if (!api) {
    api = new ContentApi({ box: config.box });
  }

  // TTL in production is 30 min and disabled in development
  const ttl = process.env.NODE_ENV == "production" ? 1000 * 60 * 30 : 0;
  const cache = new Keyv({ ttl });

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
        // Fetch content with cache first
        const cachekey = `${slug}`;
        let content = await cache.get(cachekey);
        if (!content) {
          content = await api.get(slug);
          await cache.set(cachekey, content);
          ctx.res.setHeader(FAABLE_CACHE_HEADER, "MISS");
        } else {
          ctx.res.setHeader(FAABLE_CACHE_HEADER, "HIT");
        }

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

        // if (!disableCache) {
        //   ctx.res.setHeader(
        //     "Cache-Control",
        //     `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, must-revalidate`
        //   );
        // }
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
