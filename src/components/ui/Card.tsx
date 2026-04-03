interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className = "",
  padding = "md",
}: CardProps) {
  return (
    <div
      className={`
        bg-[#EDECEA] border border-[#D8D6D1] rounded-md
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-[#D8D6D1] pb-4 mb-4 ${className}`}
    >
      {children}
    </div>
  );
}
