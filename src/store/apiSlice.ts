import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://delta.japaflex.com/api/v1/', // Change as needed
    prepareHeaders: (headers, { getState }) => {
      // We'll set the Authorization header per-request
      return headers;
    },
  }),
  endpoints: (builder) => ({
    adminLogin: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: 'admin/login',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const { useAdminLoginMutation } = apiSlice;
