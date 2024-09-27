import { FaableApiError } from "@faable/sdk-base";
import {
  ContentApi,
  ContentApiOptions,
  ContentListQueryParams,
} from "./ContentApi.js";
import Keyv from "@keyvhq/core";

type CacheStatus = "hit" | "miss";
type BoxResponse = {
  data: any;
  cache_status: CacheStatus;
};

type ContentResponse = {
  data?: any;
  cache_status: CacheStatus;
};

export const faableContentClient = (params: ContentApiOptions) => {
  // Initialize api client
  const api = ContentApi.create(params);

  // TTL in production is 30 min and disabled in development
  const cache = new Keyv({
    ttl: 1000 * 60 * 30,
    namespace: `faable-content-cache:${params.box}`,
  });

  //Gets box in cache
  const getBox = async (
    filter?: ContentListQueryParams & {
      cursor?: string;
      pageSize?: string;
    }
  ): Promise<BoxResponse> => {
    const key = "box:" + JSON.stringify(filter);
    let page = await cache.get(key);
    let cache_status: CacheStatus = "hit";
    if (!page) {
      page = await api.list(filter).pass(filter);
      await cache.set(key, page);
      cache_status = "miss";
    }

    return { data: page.results, cache_status };
  };

  // Gets content in cache
  const getContent = async (slug: string): Promise<ContentResponse> => {
    const key = "slug:" + slug;
    let data = await cache.get(key);
    let cache_status: CacheStatus = "hit";
    if (!data) {
      try {
        const res = await api.getContent(slug, { mode: "slug" });
        await cache.set(key, { res });
        data = { res };
        cache_status = "miss";
      } catch (error) {
        const e = error as FaableApiError;
        if (e.isFaableApiError && e.isStatus("not-found")) {
          await cache.set(slug, { res: null });
          data = { res: null };
        } else {
          throw e;
        }
      }
    }
    return {
      cache_status,
      data: data.res,
    };
  };

  return {
    getBox,
    getContent,
  };
};
