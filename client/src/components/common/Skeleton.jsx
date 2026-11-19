const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
};

export default Skeleton;

// usage:-
// <Skeleton className="h-5 w-40" />
// <Skeleton className="h-20 w-full" />