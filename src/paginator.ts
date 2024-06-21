import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface Page<T> {
  next: string | null;
  results: T[];
}

export class FaablePaginator {
  constructor(public client: AxiosInstance) {}
  paginate<T>(req: AxiosRequestConfig) {
    const pages: Page<T>[] = [];

    return {
      all: async () => {
        let res: AxiosResponse<Page<T>> | undefined = undefined;
        do {
          res = await this.client.request<Page<T>>({
            ...req,
            params: { ...req.params, next: res ? res.data?.next : undefined },
          });
          // console.log("Page", pages.length);
          pages.push(res.data);
        } while (res.data.next);
        return pages.map((page) => page.results).flat();
      },
    };
  }
}
