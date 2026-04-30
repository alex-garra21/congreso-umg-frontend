import { useQuery } from '@tanstack/react-query';
import { getGeneralReportQuery } from '../supabase/reports/reportQueries';

export function useGeneralReport() {
  return useQuery({
    queryKey: ['reportes', 'general'],
    queryFn: getGeneralReportQuery,
  });
}
