import { useQuery } from '@tanstack/react-query';

import { OSC_SETTINGS } from '../api/apiConstants';
import { getOSC } from '../api/ontimeApi';
import { oscPlaceholderSettings } from '../models/OscSettings.type';

export default function useOscSettings() {
  const {
    data,
    status,
    isError,
    refetch,
  } = useQuery({
    queryKey: OSC_SETTINGS,
    queryFn: getOSC,
    placeholderData: oscPlaceholderSettings,
    retry: 5,
    retryDelay: attempt => attempt * 2500,
  });

  return { data, status, isError, refetch };
}
