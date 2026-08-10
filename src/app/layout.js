import "../styles/globals.css";
import Providers from "./providers";

export const metadata = { title: "TaskMatrix — Work, clearly", description: "Enterprise project management" };

export default function RootLayout({ children }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
