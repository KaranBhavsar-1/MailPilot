const styles = {
  assistant: "bg-blue-100 text-blue-700",
  client: "bg-pink-100 text-pink-700",
  noReply: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",

  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-700",

  pending: "bg-amber-100 text-amber-700",
  handled: "bg-green-100 text-green-700",
};

const Badge = ({ variant = "review", children }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant] || styles.review}`}
    >
      {children}
    </span>
  );
};

export default Badge;


// usage:-
// <Badge variant="assistant">Assistant</Badge>
// <Badge variant="client">Client</Badge>
// <Badge variant="high">High Priority</Badge>