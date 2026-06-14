export interface QueryOptions {
  fields?: string[] | string;
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  [key: string]: unknown;
}

export function buildQueryParams(options?: QueryOptions) {
  if (!options) return undefined;

  const params: Record<string, unknown> = {};

  if (options.fields !== undefined) {
    params.fields = Array.isArray(options.fields)
      ? options.fields.join(",")
      : options.fields;
  }

  if (options.page !== undefined) {
    params.page = options.page;
  }

  if (options.limit !== undefined) {
    params.limit = options.limit;
  }

  if (options.offset !== undefined) {
    params.offset = options.offset;
  }

  if (options.sort !== undefined) {
    params.sort = options.sort;
  }

  Object.entries(options).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !["fields", "page", "limit", "offset", "sort"].includes(key)
    ) {
      params[key] = String(value);
    }
  });

  return params;
}
