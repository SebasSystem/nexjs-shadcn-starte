'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/lib/query-keys';

export interface TenantOption {
  uid: string;
  name: string;
  key: string;
}

export function useTenantOptions() {
  const industries = useQuery({
    queryKey: queryKeys.tenant.industries,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.industries).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const companySizes = useQuery({
    queryKey: queryKeys.tenant.companySizes,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.companySizes).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const institutionTypes = useQuery({
    queryKey: queryKeys.tenant.institutionTypes,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.institutionTypes).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const paymentMethods = useQuery({
    queryKey: queryKeys.tenant.paymentMethods,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.paymentMethods).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const leadOrigins = useQuery({
    queryKey: queryKeys.tenant.leadOrigins,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.leadOrigins).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const activityTypes = useQuery({
    queryKey: queryKeys.tenant.activityTypes,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.activityTypes).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const lostReasonCategories = useQuery({
    queryKey: queryKeys.tenant.lostReasonCategories,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.lostReasonCategories).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const commissionPlanTypes = useQuery({
    queryKey: queryKeys.tenant.commissionPlanTypes,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.commissionPlanTypes).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  const opportunityProducts = useQuery({
    queryKey: queryKeys.tenant.opportunityProducts,
    queryFn: () =>
      axiosInstance.get(endpoints.tenant.opportunityProducts).then((r) => r.data?.data ?? r.data),
    staleTime: 0,
  });

  return {
    industries,
    companySizes,
    institutionTypes,
    paymentMethods,
    leadOrigins,
    activityTypes,
    lostReasonCategories,
    commissionPlanTypes,
    opportunityProducts,
  };
}
