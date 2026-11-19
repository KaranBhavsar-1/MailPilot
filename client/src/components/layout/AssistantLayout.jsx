import { Outlet } from "react-router-dom";
import AssistantSidebar from "./AssistantSidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

const AssistantLayout = () => {
  return (
    <div className="flex min-h-screen bg-app-background">
      <AssistantSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        {/* <main className="flex-1 p-5 pb-24 md:p-8"> */}
        <main className="min-w-0 flex-1 p-5 pb-24 lg:p-8">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
};

export default AssistantLayout;