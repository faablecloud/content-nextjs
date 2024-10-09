import { FaableApiError } from "@faable/sdk-base";
import {
  ContentApi,
  ContentApiOptions,
  ContentListQueryParams,
} from "./ContentApi.js";
import { createStore } from "./store/createStore.js";
import { Store } from "./store/Store.js";

type CacheStatus = "hit" | "miss";
type BoxResponse = {
  data: any;
  cache_status: CacheStatus;
};

type ContentResponse = {
  data?: any;
  cache_status: CacheStatus;
};

type ContentClientOptions = {
  api?: ContentApiOptions;
  store?: Store;
};

export const faableContentClient = (config?: ContentClientOptions) => {
  // Initialize api client
  const api = ContentApi.create(config?.api || {});

  // TTL in production is 30 min and disabled in development
  const cache = config?.store || createStore(config?.api?.box);

  //Gets box in cache
  const getBox = async (
    box: string = "default",
    filter?: ContentListQueryParams & {
      cursor?: string;
      pageSize?: string;
    }
  ): Promise<BoxResponse> => {
    const query = {
      box,
      ...filter,
    };
    const key = "box:" + JSON.stringify(query);
    let page = await cache.get(key);
    let cache_status: CacheStatus = "hit";
    if (!page) {
      page = await api.list(query).pass(query);
      await cache.set(key, page);
      cache_status = "miss";
    }

    return { data: page.results, cache_status };
  };

  // Gets content in cache
  const getContent = async (params: {
    slug: string | string[];
    box?: string;
  }): Promise<ContentResponse> => {
    const slug = Array.isArray(params.slug) ? params.slug.join() : params.slug;
    const key = ["content", params.box, slug].join(":");
    let data = await cache.get(key);
    let cache_status: CacheStatus = "hit";
    if (!data) {
      try {
        const res = await api.getContent(slug, {
          mode: "slug",
          box: params.box,
        });
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
