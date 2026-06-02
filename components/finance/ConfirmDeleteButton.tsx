"use client";

interface Props {
  message?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A submit button that shows a browser confirm dialog before submitting.
 * Use inside a <form> — it calls e.preventDefault() if the user cancels.
 */
export default function ConfirmDeleteButton({ message = "Are you sure?", className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
