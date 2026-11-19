const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-white border border-app-border text-app-text hover:bg-gray-50",
  ghost: "bg-transparent text-app-muted hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;


// usage:-
// <Button>Save</Button>
// <Button variant="secondary">Cancel</Button>
// <Button variant="danger">Delete</Button>
// <Button variant="ghost">More</Button>