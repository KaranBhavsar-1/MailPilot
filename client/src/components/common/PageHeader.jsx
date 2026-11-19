const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-text">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-app-muted">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;