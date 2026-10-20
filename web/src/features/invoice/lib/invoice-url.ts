const PARAM = 'id';

export const invoiceUrl = {
  read: () => new URLSearchParams(window.location.search).get(PARAM),

  write(id: string | null) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(null, '', url);
  },
};
