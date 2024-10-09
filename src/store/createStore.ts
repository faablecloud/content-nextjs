import Keyv from "@keyvhq/core";

export const createStore = (name?: string) => {
  // TTL in production is 30 min and disabled in development
  const cache = new Keyv({
    ttl: 1000 * 60 * 30,
    namespace: [`faable-content-cache`, name].join(":"),
  });
  return cache;
};
