"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets a <form action={…}> after the action runs, which would wipe
 * everything the user typed whenever the server returns validation errors.
 * Submitting through onSubmit instead keeps the values. The clicked submit
 * button's name/value (e.g. intent=another) is preserved. Keep action={…} on the
 * form too: before hydration the browser then POSTs to the server action
 * instead of falling back to a GET that would put field values in the URL.
 */
export function useKeepValuesSubmit(action: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(() => action(data));
  };
}
