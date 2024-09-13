import { GetServerSideProps } from "next";
import { AxiosError } from "axios";
import { Content, ContentApi } from "./ContentApi";
import Keyv from "@keyvhq/core";

export type WithPageContentConfig = {
  api?: ContentApi;
  box?: string;
  maxAge?: number;
  disableCache?: boolean;
  staleWhileRevalidate?: number;
  forceDevelopmentCache?: boolean;
};

const FAABLE_CACHE_HEADER = `X-Faable-Content-Cache`;

export const withPageContent = (config: WithPageContentConfig = {}) => {
  let api: ContentApi = config.api as any;
  if (!api) {
    api = new ContentApi({ box: config.box });
  }

  // TTL in production is 30 min and disabled in development
  const contentCacheEnabled =
    process.env.NODE_ENV == "production" || config.forceDevelopmentCache;
  const cache = new Keyv({
    ttl: 1000 * 60 * 30,
    namespace: `faable-content-cache:${config?.box}`,
  });

  const contentFetch = async (slug: string) => {
    try {
      return await api.get(slug);
    } catch (error) {
      const e: AxiosError = error as any;
      if (e.response?.status == 404) {
        return null;
      }
      throw e;
    }
  };

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

      // Fetch content with cache first
      let content: Content | null = null;
      if (contentCacheEnabled) {
        // In production, check if content is in local cache first
        const cachekey = `${slug}`;
        content = await cache.get(cachekey);
        if (!content) {
          content = await contentFetch(slug);
          await cache.set(cachekey, content);
          ctx.res.setHeader(FAABLE_CACHE_HEADER, "MISS");
        } else {
          ctx.res.setHeader(FAABLE_CACHE_HEADER, "HIT");
        }
      } else {
        // Always request content in development
        ctx.res.setHeader(FAABLE_CACHE_HEADER, "MISS");
        content = await contentFetch(slug);
      }

      if (!content) {
        return {
          notFound: true,
        };
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
    };
};
