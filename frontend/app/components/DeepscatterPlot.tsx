'use client';

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { DATASET_CONFIGS, COMMON_PREFS } from './datasetConfigs';

export interface DeepscatterPlotHandle {
  zoomTo: (x: number, y: number, k?: number) => void;
}

interface DeepscatterPlotProps {
  dataset: string;
  apiUrl: string;
  onNodeClick?: (id: number) => void;
}

const DeepscatterPlot = forwardRef<DeepscatterPlotHandle, DeepscatterPlotProps>(
  function DeepscatterPlot({ dataset, apiUrl, onNodeClick }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const plotRef = useRef<any>(null);
    const onNodeClickRef = useRef(onNodeClick);

    // Keep callback ref up to date without triggering re-renders
    useEffect(() => {
      onNodeClickRef.current = onNodeClick;
    }, [onNodeClick]);

    useImperativeHandle(ref, () => ({
      zoomTo: (x: number, y: number, k = 100) => {
        plotRef.current?._zoom?.zoom_to(k, x, y);
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      let destroyed = false;
      let plot: any = null;
      let bgClickHandler: ((event: MouseEvent) => void) | null = null;
      let labelJustClicked = false;

      (async () => {
        const { Scatterplot } = await import('deepscatter');
        if (destroyed) return;

        const config = DATASET_CONFIGS[dataset];
        if (!config) return;

        // Clear any leftover children from a previous mount (StrictMode)
        const container = containerRef.current;
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }

        plot = new Scatterplot('#deepscatter-container');
        plotRef.current = plot;

        const prefs = {
          source_url: `${apiUrl}/data/tiles/${dataset}`,
          ...COMMON_PREFS,
          point_size: config.pointSize,
          encoding: {
            color: config.encoding.color,
            x: { field: 'x', transform: 'literal' },
            y: { field: 'y', transform: 'literal' },
          },
        };

        try {
          await plot.plotAPI(prefs);
        } catch (e) {
          if (destroyed) return;
          throw e;
        }
        if (destroyed) return;

        plot._zoom?.zoom_to(0.7, 0, 0);

        // Click handler — datum.id is float in Arrow tiles, convert to int
        plot.click_function = (datum: any) => {
          const id = Math.round(Number(datum.id));
          if (!isNaN(id)) onNodeClickRef.current?.(id);
        };

        // Tooltip
        plot.tooltip_html = (datum: any) => {
          const nameField = config.nameField;
          const name = datum[nameField] || '';
          const cls = datum.class || '';
          return `
            <div class="custom-tooltip">
              <h4>${name}</h4>
              <p>${cls}</p>
            </div>
          `;
        };

        // Labels
        try {
          plot.add_labels_from_url(
            `${apiUrl}/data/labels/${dataset}`,
            'location',
            'LOCATION',
            undefined,
            { useColorScale: true, margin: 0, draggable_labels: false },
          );
        } catch (e) {
          console.warn('Failed to load labels:', e);
        }

        // Label click for highlighting
        const initialEncoding = { ...prefs.encoding };

        plot.label_click = async (datum: any) => {
          if (destroyed) return;
          labelJustClicked = true;
          const genre = datum.text;
          const colorDomain = config.encoding.color.domain;
          const colorRange = config.encoding.color.range;

          if (Array.isArray(colorDomain) && Array.isArray(colorRange)) {
            const idx = colorDomain.indexOf(genre);
            const color = idx >= 0 ? colorRange[idx] : 'gray';
            await plot.plotAPI({
              encoding: {
                color: {
                  field: genre,
                  type: 'nominal',
                  domain: [0, 1],
                  range: ['#3337', color],
                },
              },
            });
          }
        };

        // Click on background to clear highlights (skip if a label was just clicked)
        bgClickHandler = (event: MouseEvent) => {
          if (destroyed) return;
          if (labelJustClicked) {
            labelJustClicked = false;
            return;
          }
          const target = event.target as HTMLElement;
          if (!target.closest('.node') && !target.matches('#select')) {
            plot.plotAPI({ encoding: initialEncoding });
          }
        };
        container?.addEventListener('click', bgClickHandler);
      })();

      return () => {
        destroyed = true;
        if (bgClickHandler && containerRef.current) {
          containerRef.current.removeEventListener('click', bgClickHandler);
        }
        if (plot) {
          try {
            plot.destroy();
          } catch (e) {
            // WebGL context may already be lost
          }
        }
        plotRef.current = null;
      };
    }, [dataset, apiUrl]);

    return (
      <div
        id="deepscatter-container"
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
    );
  },
);

export default DeepscatterPlot;
