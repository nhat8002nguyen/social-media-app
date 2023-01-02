import { ApolloProvider } from "@apollo/client";
import { NextUIProvider } from "@nextui-org/react";
import { createApolloClient } from "contexts/apollo";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { wrapper } from "redux/store/store";
import "../styles/globals.css";

function MyApp({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps: wrapperPageProps } = props;

  const apolloClient = createApolloClient();

  return (
    <Provider store={store}>
      <SessionProvider session={wrapperPageProps.session}>
        <NextUIProvider>
          <ApolloProvider client={apolloClient}>
            <Component {...wrapperPageProps} />
          </ApolloProvider>
        </NextUIProvider>
      </SessionProvider>
    </Provider>
  );
}

export default wrapper.withRedux(MyApp);
