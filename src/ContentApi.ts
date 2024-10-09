import { ApiParams, FaableApi } from "@faable/sdk-base";

export interface Content {
  id: string;
  status: "private" | "public";
  data: string;
}

export type BoxParams = {
  box?: string;
};

export type ContentListQueryParams = {
  include_data?: boolean;
  context_content_id?: string;
  status?: "public" | "private";
  categories?: string[];
} & BoxParams;

export type GetContenQueryParams = {
  mode?: "slug";
} & BoxParams;

export type ContentApiOptions = {
  box?: string;
} & ApiParams;

export class ContentApi extends FaableApi<ContentApiOptions> {
  constructor(params: ContentApiOptions) {
    super({
      ...params,
      baseURL: "https://api-content.faable.link",
      fetcher: {
        ...params?.fetcher,
        params: {
          box: params.box,
        },
      },
    });
  }

  list(params: ContentListQueryParams = { include_data: false }) {
    return this.paginator<Content>({ url: "/content", params });
  }

  getContent(slug_or_id: string, params?: GetContenQueryParams) {
    return this.fetcher.get<Content>(`/content/${slug_or_id}`, { params });
  }
}
