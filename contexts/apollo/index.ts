import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

// window === object => process is in browser
const wsLink =
  typeof window === "object"
    ? new WebSocketLink({
        uri: `wss://refined-baboon-56.hasura.app/v1/graphql`,
        options: {
          reconnect: true,
          lazy: true,
          inactivityTimeout: 3000,
          connectionParams: {
            headers: {
              "content-type": "application/json",
              "x-hasura-admin-secret":
                process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
            },
          },
        },
      })
    : null;

export const createApolloClient = () => {
  return new ApolloClient({
    link: wsLink,
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV === "development",
  });
};
