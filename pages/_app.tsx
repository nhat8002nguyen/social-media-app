import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { wrapper } from "redux/store/store";
import "../styles/globals.css";

function MyApp({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps: wrapperPageProps } = props;
  return (
    <Provider store={store}>
      <SessionProvider session={wrapperPageProps.session}>
        <NextUIProvider>
          <Component {...wrapperPageProps} />
        </NextUIProvider>
      </SessionProvider>
    </Provider>
  );
}

export default wrapper.withRedux(MyApp);
