import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface TeamSetupBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const TeamSetupBreadcrumb: React.FC<TeamSetupBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-[hsl(var(--wq-text-muted))]">&gt;</span>
          )}
          {item.href && !item.isActive ? (
            <Link 
              to={item.href}
              className="text-[hsl(var(--wq-text-secondary))] hover:text-[hsl(var(--wq-primary))] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={
                item.isActive 
                  ? "text-[hsl(var(--wq-accent))] font-medium" 
                  : "text-[hsl(var(--wq-text-secondary))]"
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
