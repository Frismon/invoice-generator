import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface FormState {
  errorFor(path: string): string | undefined;
}

const FormStateContext = createContext<FormState>({ errorFor: () => undefined });

export function FormStateProvider({ errorFor, children }: FormState & { children: ReactNode }) {
  const value = useMemo(() => ({ errorFor }), [errorFor]);
  return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
}

export const useFormState = () => useContext(FormStateContext);
