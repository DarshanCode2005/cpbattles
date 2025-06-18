export default function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  props.disabled = props.disabled || false;
  return (
    <button
      {...props}
      className={[
        "bg-blue-500 text-white px-6 py-2 rounded  transition",
        props.className || "",
        props.disabled ? "opacity-50 cursor-not-allowed" : "",
        !props.disabled ? "hover:bg-blue-600" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
