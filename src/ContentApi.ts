import { AxiosInstance, AxiosResponse } from "axios";
import { authorize } from "@faable/auth-helpers-axios";
import axios from "axios";
import { FaablePaginator } from "./paginator";
export interface Content {
  id: string;
  status: "private" | "public";
  data: string;
}

export interface PageQueryParams {
  cursor?: string;
  pageSize?: number;
}

export interface Page<T> {
  next: string | null;
  results: T[];
}

const handleResponse = async <T>(prom: Promise<AxiosResponse<T>>) => {
  const res = await prom;
  return res.data;
};

export type ContentListQueryParams = {
  include_data?: boolean;
  box?: string;
  context_content_id?: string;
  status?: "public" | "private";
  categories?: string[];
} & PageQueryParams;

interface ContentApiOptions {
  client: AxiosInstance;
  box: string;
}
export class ContentApi {
  client: AxiosInstance;
  paginator: FaablePaginator;

  constructor(options: Partial<ContentApiOptions> = {}) {
    // Set client
    if (options.client) {
      this.client = options.client;
    } else {
      this.client = authorize({
        client: axios.create({ baseURL: "https://api-content.faable.link" }),
      });
    }

    if (options.box) {
      this.client.defaults.params = {
        box: options.box,
      };
    }
    this.paginator = new FaablePaginator(this.client);
  }

  list(params: ContentListQueryParams = {}) {
    return this.paginator.paginate<Content>({ url: "/content", params });
  }

  get(slug_or_id: string, _params: { box?: string } = {}) {
    const params = {
      mode: "slug",
      ..._params,
    };
    return handleResponse(
      this.client.get<Content>(`/content/${slug_or_id}`, {
        params,
      })
    );
  }
}
