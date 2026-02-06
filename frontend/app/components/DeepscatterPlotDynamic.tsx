import dynamic from 'next/dynamic';

export const DeepscatterPlotDynamic = dynamic(
  () => import('./DeepscatterPlot'),
  { ssr: false },
);
