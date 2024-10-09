export interface Store {
  get(key: string): Promise<any>;
  set(key: string, data: any): Promise<void>;
}
