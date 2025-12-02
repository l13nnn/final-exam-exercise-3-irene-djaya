import { AppProvider } from '../context/AppContext';
import 'antd/dist/reset.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;