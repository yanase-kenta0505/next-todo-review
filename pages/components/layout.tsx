import { ReactElement } from "react";
import Header from "./header";

type LayoutProps = Required<{
  readonly children: ReactElement;
}>;

const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <div className="m-full min-h-screen mx-auto flex flex-col items-center bg-slate-50 pt-16">
      {children}
    </div>
  </>
);

export default Layout;
