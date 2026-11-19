import { useLocation } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

const pageDetails = {
  "/app": {
    title: "Overview",
    subtitle: "Your email workspace at a glance.",
  },
  "/app/inbox": {
    title: "All Inbox",
    subtitle: "Manage all your email conversations.",
  },
  "/app/priority": {
    title: "Priority",
    subtitle: "Focus on your most important emails.",
  },
  "/app/waiting": {
    title: "Waiting",
    subtitle: "Conversations awaiting a response.",
  },
  "/app/archive": {
    title: "Archive",
    subtitle: "Your archived conversations.",
  },
};

const WorkspacePage = () => {
  const { pathname } = useLocation();
  const page = pageDetails[pathname] || pageDetails["/app"];

  return (
    <>
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
      />

      <EmptyState
        title="Your workspace is ready"
        description="Email conversations will appear here when we connect the inbox features."
      />
    </>
  );
};

export default WorkspacePage;