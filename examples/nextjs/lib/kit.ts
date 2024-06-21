import { api } from "@core-school/kit";

export const kit = api({
  auth_strategy: "client_credentials",
  client_id: process.env.KIT_CLIENT_ID,
  client_secret: process.env.KIT_CLIENT_SECRET,
});
